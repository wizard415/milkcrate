'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ListView,
  TextInput,
  TouchableOpacity,
  Alert,
  Button,
  Linking
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as actionDetailActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import * as commonActions from '../../common/actions';

import NavTitleBar from '../../components/navTitleBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';

import Point from '../../components/Point';
import EarnedPoint from '../../components/earnedPoint';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'
import Cache from '../../components/Cache'

//for comment UI
import BusinessRecentActivityListCell from '../components/businessRecentActivityListCell';
import Stars from 'react-native-stars-rating';

class ActionDetail extends Component {
  constructor(props) {
    super(props);
    //for comment UI
    this.dataSourceRecentActivity = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      initialize: true,
      didStatus: false,
      activityId: null,
      pinned: false,
      loading: true,
      showAnimiation: false,
      //for comment UI
      comments: [],
      user: {}
    };
  }

  componentDidMount(){
    this.hasMounted = true
    const action = this.props.action
    var challenges = Cache.getMapData('challenges');
    this.existChallenge = _.find(challenges, (o)=>{
      return o.activity._id == action._id
    })
    UtilService.mixpanelEvent("Viewed an Activity", {
      "type":"action",
      challenge:(this.existChallenge?true:false),
      points:Math.max(action.points || 1, 1),
      client:Cache.community.name,
      activity:action.name
    })

    bendService.logActivityView(action._id, 'action', 'view');

    bendService.getPinnedActivities((err, rets)=>{
      var exist = _.find(rets, (o)=>{
        return o._id == this.props.action._id
      })

      //console.log("getPinnedActivities", rets.length, rets, this.props.business._id, exist)

      this.hasMounted && this.setState({
        pinned: exist ? true: false,
      })
    })
    //For comment UI
    bendService.getUser( (error, result) => {
      if (error) {
        console.log(error);
        return;
      }

      this.hasMounted && this.setState({
        user: result,
      })
    })

    bendService.checkActivityDid(action._id,'action', (error, result) => {
      
      if (error) {
        console.log(error);
        return;
      }

      if (result) {
          this.state.activityId = result;
      }

      this.hasMounted && this.setState({
        didStatus: result == false ? false : true,
        loading:false
      });
    })
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  onBack () {
    Actions.pop();
  }

  onCheckIn() {
    bendService.captureActivity(this.props.action._id, 'action', (error, result)=>{
      if (error){
        console.log(error);
        return;
      }

      this.state.activityId = result.activity._id;
      this.props.commonActions.captureActivity(result.activity._id);

      this.hasMounted && this.setState({
        didStatus: true,
        showAnimiation: true
      });

      bendService.logActivityView(this.props.action._id, 'action', 'did');

      UtilService.mixpanelEvent("Did an Action",
          {
            category:UtilService.getCategoryName(this.props.action.categories),
            challenge:(this.existChallenge?true:false),
            points:Math.max(this.props.action.points || 1, 1)
          }
      );
    })
  }

  onUncheckIn() {
    bendService.removeActivity(this.state.activityId, (error, result)=>{
      if (error){
        console.log(error);
        return;
      }

      this.props.commonActions.removeActivity(this.state.activityId);
      this.state.activityId = null;

      this.hasMounted && this.setState({
        didStatus: false,
        showAnimiation:false
      })
    })
  }

  visitWebSite(url) {
    url = UtilService.fixUrl(url);
    if(url) {
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        }
      }).catch((error)=>{
        //console.log("URL open error");
      });
    }
  }

  onPin() {
    if (this.state.pinned) {
      bendService.unpinActivity({
        type: 'action',
        id: this.props.action._id,
        name: this.props.action.name,
      }, (error, resut) => {
        if (!error) {
          this.hasMounted && this.setState({
            pinned: false,
          });
          this.props.commonActions.updateRecentPinnedActivities();
          this.props.commonActions.updateAllPinnedActivities();
        }
      });
    } else {
      bendService.pinActivity({
        type: 'action',
        id: this.props.action._id,
        name: this.props.action.name,
      }, (error, result) => {
        if (!error) {
          this.hasMounted && this.setState({
            pinned: true,
          });
          this.props.commonActions.updateRecentPinnedActivities();
          this.props.commonActions.updateAllPinnedActivities();
        }
      });
    }
  }

  onComment() {
    //console.log(this.state.businessRate, this.state.comment)
    if (UtilService.isValid(this.state.comment)) {
      bendService.captureComment({
        id: this.props.action._id,
        type: 'action',
        comment: this.state.comment,
      }, (error, result)=>{
        if (error) {
          console.log(error);
          return;
        }
        this.state.comments.unshift(result);
        this.hasMounted && this.setState({
          comment: "",
          comments: this.state.comments,
        })
      })
    }
  }

  renderRecentActivityRow(rowData, sectionID, rowID) {
    return (
      <BusinessRecentActivityListCell
        name={ rowData.user.name }
        description={ rowData.comment }
        avatar={ rowData.user.avatar ? UtilService.getSmallImage(rowData.user.avatar) : '' }
        avatarBackColor={ UtilService.getBackColor(rowData.user.avatar) }
        defaultAvatar={ UtilService.getDefaultAvatar(rowData.user.defaultAvatar) }
        time={ UtilService.getPastDateTime(rowData._bmd.createdAt) }
        rating={ Number(rowData.rating || 0) }
        onClick={ () => this.onRecentActivityCellPressed(rowID) }
      />
    );
  }

  render() {
    const { 
      action,
      modal,
    } = this.props;

    var category = _.find(Cache.categories, (obj) => {
      return obj._id == action.categories[0]
    })

    var backgroundImage, backgroundColor;
    var imageObj = action.coverImage ? action.coverImage : category.coverImage;
    backgroundImage = UtilService.getLargeImage(imageObj);
    backgroundColor = UtilService.getBackColor(imageObj);
    var avatar = this.state.user.avatar ? UtilService.getSmallImage(this.state.user.avatar) : null;
    var defaultAvatar = this.state.user.defaultAvatar ? UtilService.getDefaultAvatar(this.state.user.defaultAvatar) : null;
    
    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ (modal ? commonStyles.NavCloseButton : commonStyles.NavBackButton) | commonStyles.NavPinButton }
          onBack={ this.onBack }
          title ={action.name}
          isPin = { this.state.pinned }
          onPin = { () => this.onPin() }
        />
        <ScrollView>
          { this.state.initialize && <Image style={ [styles.imageTopBackground, { backgroundColor:backgroundColor }] } source={{ uri:backgroundImage }}/> }
          <View style={ styles.mainContentContainer }>
            <View style={ styles.infoContainer }>
              <Image style={ styles.imageIcon } source={ UtilService.getCategoryIconFromSlug(action) } />
              <View style={ styles.infoSubContainer }>
                <Text style={ styles.textTitle }>{ action.name }</Text>
              </View>
              <Point point={ Math.max(action.points || 1, 1) }/>
            </View>
            <Text style={ styles.textDescription }>{ action.description }</Text>
            { UtilService.isValidURL(action.url) && <View style={ styles.buttonContainer }>
              <TouchableOpacity onPress={ () => this.visitWebSite(action.url) }>
                <View style={ styles.buttonWrapper }>
                  <Text style={ styles.urlTextButton }>Visit the Website</Text>
                </View>
              </TouchableOpacity>
            </View> }
          </View>
          { action.tags && action.tags.length>0 && <View style={ styles.tagsContainer }>
            <Text style={ styles.textHeading }>Tags</Text>
            <View style={ styles.tagsButtonContainer }>
              {
                action.tags.map( (obj, index) => {
                  return (
                    <View key={'tag-' + index} style={ styles.buttonTagsWrapper }>
                      <Text style={ styles.textTagsButton }>{ obj }</Text>
                    </View>
                  )
                })
              }
            </View>
          </View>}

          <View style={ styles.recentActivityContainer }>
            <View style={ styles.sectionTitleWrapper }>
              <Text style={ styles.textSectionTitle }>Comments</Text>
            </View>
            <View style={ styles.recentActivityListViewWrapper }>
              <ListView
                enableEmptySections={ true }
                dataSource={ this.dataSourceRecentActivity.cloneWithRows(this.state.comments) }
                renderRow={ this.renderRecentActivityRow.bind(this) }
              />
            </View>
          </View>
          <View style={ styles.ratingMainContainer }>
            { avatar && <Image style={ [styles.imageCategory, { backgroundColor:UtilService.getBackColor(avatar) }]} source={{ uri:avatar }} /> }
            { !avatar && defaultAvatar && <Image style={ styles.imageCategory } source={ defaultAvatar }/> }
            <View style={ styles.rating_commentContentContainer }>
              <TextInput
                autoCapitalize="none"
                autoCorrect={ false }
                multiline={ false }
                placeholder="Add a comment"
                placeholderTextColor={ commonColors.placeholderText }
                textAlign="left"
                style={ styles.input }
                underlineColorAndroid="transparent"
                returnKeyType={ 'done' }
                value={this.state.comment}
                onChangeText={ (text) => this.hasMounted && this.setState({ comment: text }) }
                onSubmitEditing={ () => this.onComment() }
              />              
            </View>
          </View>
          <View style={ styles.buttonRateBusinessWrapper }>
            <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onComment() }>
              <View style={ styles.buttonRateBusiness }>
                <Text style={ styles.textButton }>Comment</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        { !this.state.loading && !this.state.didStatus && <TouchableOpacity onPress={ () => this.onCheckIn() }>
          <View style={ styles.buttonCheckin }>
            <Text style={ styles.textButton }>I Did This</Text>
          </View>
        </TouchableOpacity>}
        { !this.state.loading && this.state.didStatus && <TouchableOpacity onPress={ () => this.onUncheckIn() }>
          <View style={ styles.buttonGrey }>
            <Text style={ styles.textOrange }>I Didn't Do It</Text>
          </View>
        </TouchableOpacity> }
        {<EarnedPoint show={ this.state.showAnimiation } point={Math.max(action.points || 1, 1)}/>}
      </View>
    );
  }
}

export default connect(state => ({
  status: state.search.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(actionDetailActions, dispatch),
    commonActions: bindActionCreators(commonActions, dispatch),
  })
)(ActionDetail);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContentContainer: {
    paddingLeft: 20,
    paddingRight: 16,
  },
  imageTopBackground: {
    width: commonStyles.screenWidth,
    height: commonStyles.hp(24),
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  infoSubContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 8,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  imageIcon: {
    width: 40,
    height: 40,
  },
  textTitle: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  textDescription: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 14,
    paddingVertical: 12,
  },
  textButton: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
  },
  textOrange: {
    color: '#F59174',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
  },
  buttonCheckin: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: commonColors.bottomButton,
    height: 40,
  },
  buttonGrey: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    height: 40,
  },
  buttonContainer: {
    paddingTop: 24,
    paddingBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    width:commonStyles.screenWidth-50,
    backgroundColor: "#EFEFEF",
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 24,
    borderRadius: 5,
  },
  urlTextButton: {
    color: '#5E8AA3',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
  },
  tagsContainer: {
    paddingLeft: 20,
    paddingRight: 16,
    paddingTop: 5,
  },
  tagsButtonContainer: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap'
  },
  buttonTagsWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: "#EFEFEF",
    borderWidth: 5,
    borderStyle: 'solid',
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5
  },
  textTagsButton: {
    textAlign: 'center',
    backgroundColor: "#EFEFEF",
    color: "#A4A4A3",
    fontFamily: 'Open Sans',
    fontSize: 12,
  },
  textHeading: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    paddingVertical: 10,
  },
  recentActivityContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop:20
  },
  recentActivityListViewWrapper: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
  },
  sectionTitleWrapper: {
    paddingBottom: 10,
    paddingLeft: 5,
  },
  textSectionTitle: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
  },
  ratingMainContainer: {
    flexDirection: 'row',
    paddingTop: 15,
    paddingLeft: 5,
    paddingRight: 15,
  },
  rating_commentContentContainer: {
    flex: 1,
    paddingLeft: 15,
    alignItems: 'flex-start',
  },  
  input: {
    fontSize: 14,
    color: commonColors.title,
    height: 64,
    alignSelf: 'stretch',
    borderColor: '#efefef',
    backgroundColor: '#efefef',
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  buttonRateBusinessWrapper: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginVertical: 10,
    paddingRight: 15,
  },
  buttonRateBusiness: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: commonColors.theme,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: commonColors.theme,
    borderStyle: 'solid',
    height: 32,
  },
  textButton: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
  },
  imageCategory: {
    width: 32,
    height: 32,
    borderRadius: 3,
  },
});

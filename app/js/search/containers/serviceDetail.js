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
  Linking,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as actionDetailActions from '../actions';
import { connect } from 'react-redux';
import * as commonActions from '../../common/actions';

import { Actions } from 'react-native-router-flux';
import NavTitleBar from '../../components/navTitleBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';
import Point from '../../components/Point';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'
import Cache from '../../components/Cache'
import EarnedPoint from '../../components/earnedPoint';

class ServiceDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      didStatus:false,
      activityId:null,
      pinned: false,
      loading: true,
      showAnimiation: false,
    };

    //console.log('this.props.service : ', this.props.service);
    this.category = null;

    if (this.props.service != null && this.props.service.categories) {
      this.category = _.find(Cache.categories, (obj)=>{
        return obj._id == this.props.service.categories[0]
      })
    }
  }

  componentDidMount(){
    this.hasMounted = true
    const service = this.props.service

    var challenges = Cache.getMapData('challenges');
    this.existChallenge = _.find(challenges, (o)=>{
      return o.activity._id == service._id
    })
    UtilService.mixpanelEvent("Viewed an Activity", {
      "type":"service",
      challenge:(this.existChallenge?true:false),
      points:Math.max(service.points || 1, 1),
      client:Cache.community.name,
      activity:service.name
    })

    bendService.logActivityView(service._id, 'service', 'view');

    bendService.getPinnedActivities((err, rets)=>{
      var exist = _.find(rets, (o)=>{
        return o._id == service._id
      })

      //console.log("getPinnedActivities", rets.length, rets, this.props.business._id, exist)

      this.hasMounted && this.setState({
        pinned: exist ? true: false,
      })
    })

    bendService.checkActivityDid(service._id, 'service', (error, result)=>{

      if (error) {
        console.log(error);
        return;
      }

      if (result)
        this.state.activityId = result;

      this.hasMounted && this.setState({
        didStatus: result == false ? false : true,
        loading:false
      })
    })
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  onBack () {
    Actions.pop()
  }

  onCheckIn() {
    bendService.captureActivity(this.props.service._id, 'service', (error, result) => {
      if (error){
        console.log(error);
        return;
      }

      this.state.activityId = result.activity._id;

      this.hasMounted && this.setState({
        didStatus: true,
        showAnimiation: true
      })

      bendService.logActivityView(this.props.service._id, 'service', 'did');

      UtilService.mixpanelEvent("Registered for a Service", {
        category:UtilService.getCategoryName(this.props.service.categories),
        challenge:(this.existChallenge?true:false),
        points:Math.max(this.props.service.points || 1, 1)
      })

    })

    if (this.props.service.url)
      this.visitWebSite(this.props.service.url);
  }

  onUncheckIn() {
    bendService.removeActivity(this.state.activityId, (error, result) => {
      
      if (error){
        console.log(error);
        return;
      }

      this.state.activityId = null;

      this.hasMounted && this.setState({
        didStatus: false,
        showAnimiation: false,
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
        type: 'service',
        id: this.props.service._id,
        name: this.props.service.name,
      }, (error, result) => {
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
        type: 'service',
        id: this.props.service._id,
        name: this.props.service.name,
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

  render() {
    const { 
      service,
      modal,
    } = this.props;

    var backgroundImage, backgroundColor;
    var imageObj = service && service.coverImage ? service.coverImage : this.category && this.category.coverImage;
    if(imageObj) {
      backgroundImage = UtilService.getLargeImage(imageObj);
      backgroundColor = UtilService.getBackColor(imageObj);
    }

    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ (modal ? commonStyles.NavCloseButton : commonStyles.NavBackButton) | commonStyles.NavPinButton }
          onBack={ this.onBack }
          title ={ service.name }
          isPin = { this.state.pinned }
          onPin = { this.onPin.bind(this) }
        />
        <ScrollView>
          {imageObj && <Image style={ [styles.imageTopBackground, { backgroundColor:backgroundColor }] } source={{ uri: backgroundImage }}/>}
          <View style={ styles.mainContentContainer }>
            <View style={ styles.infoContainer }>
              {this.category && <Image style={ styles.imageIcon } source={ UtilService.getCategoryIconFromSlug(service) } />}
              {!this.category && <Image style={ styles.imageIcon } source={ UtilService.getMilkCrateLogo() } />}
              <View style={ styles.infoSubContainer }>
                <Text style={ styles.textTitle }>{ service.name }</Text>
              </View>
              <Point point={ Math.max(service.points || 1, 1)} />
            </View>
            <Text style={ styles.textDescription }>{ service.description }</Text>
            { UtilService.isValidURL(service.url) && <View style={ styles.buttonContainer }>
              <TouchableOpacity onPress={ () => this.visitWebSite(service.url) }>
                <View style={ styles.buttonWrapper }>
                  <Text style={ styles.urlTextButton }>Visit the Website</Text>
                </View>
              </TouchableOpacity>
            </View> }
          </View>
          { service.tags && (service.tags.length > 0) && <View style={ styles.tagsContainer }>
            <Text style={ styles.textHeading }>Tags</Text>
            <View style={ styles.tagsButtonContainer }>
              {
                service.tags.map( (obj, index) => {
                  return (
                    <View key={'tag-' + index} style={ styles.buttonTagsWrapper }>
                      <Text style={ styles.textTagsButton }>{ obj }</Text>
                    </View>
                  )
                })
              }
            </View>
          </View> }
        </ScrollView>
        { !this.state.loading && !this.state.didStatus && <TouchableOpacity onPress={ () => this.onCheckIn() }>
          <View style={ styles.buttonCheckin }>
            <Text style={ styles.textButton }>{ service.callToAction || 'I Did This' }</Text>
          </View>
        </TouchableOpacity>}
        { !this.state.loading && this.state.didStatus && <TouchableOpacity onPress={ () => this.onUncheckIn() }>
            <View style={ styles.buttonGrey }>
              <Text style={ styles.textOrange }>I Didn't Do It</Text>
            </View>
          </TouchableOpacity> }
        {<EarnedPoint show={ this.state.showAnimiation } point={Math.max(service.points || 1, 1)}/>}
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
)(ServiceDetail);

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
});

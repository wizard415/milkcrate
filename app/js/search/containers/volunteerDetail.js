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
Linking,
    Modal,
  Platform
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as volunteerDetailActions from '../actions';
import { connect } from 'react-redux';
import * as commonActions from '../../common/actions';

import { Actions } from 'react-native-router-flux';
import MapView from 'react-native-maps';
import NavTitleBar from '../../components/navTitleBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';
import Point from '../../components/Point';
import TextField from 'react-native-md-textinput';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'
import Cache from '../../components/Cache'
import EarnedPoint from '../../components/earnedPoint';

const icon =   require('../../../assets/imgs/category-stickers/bicycles.png');
const map_pin = require('../../../assets/imgs/map_marker.png');
const web = require('../../../assets/imgs/web.png');

const ASPECT_RATIO = commonStyles.screenHeight / commonStyles.screenHeight;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class VolunteerDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      didStatus: false,
      activityId: null,

      user: {},

      currentLocation: null,
      modalVisible: false,
      hoursNumber: "0",
      pinned: false,
      loading: true,
      showAnimiation: false,
    };
    
    this.category = _.find(Cache.categories, (obj)=>{
      return obj._id == this.props.volunteer.categories[0]
    })
    
    this.mounted = false
  }

  componentDidMount() {
    this.mounted = true
    const { volunteer } = this.props;

    var challenges = Cache.getMapData('challenges');
    this.existChallenge = _.find(challenges, (o)=>{
      return o.activity._id == volunteer._id
    })
    UtilService.mixpanelEvent("Viewed an Activity", {
      "type":"volunteer",
      challenge:(this.existChallenge?true:false),
      points:Math.max(volunteer.points || 1, 1),
      client:Cache.community.name,
      activity:volunteer.name
    })

    bendService.logActivityView(volunteer._id, 'volunteer_opportunity', 'view');

    bendService.getPinnedActivities((err, rets)=>{
      var exist = _.find(rets, (o)=>{
        return o._id == volunteer._id
      })

      //console.log("getPinnedActivities", rets.length, rets, this.props.business._id, exist)

      this.mounted && this.setState({
        pinned: exist ? true: false,
      })
    })

    bendService.checkActivityDid(volunteer._id, 'volunteer_opportunity', (error, result) => {
      
      if (error) {
        console.log(error);
        return;
      }

      if (result) {
        this.mounted && (this.state.activityId = result);
      }

      this.mounted && this.setState({
        didStatus: result == false ? false : true,
        loading:false
      })
    })

    navigator.geolocation.getCurrentPosition( 
      (position) => {
        this.mounted && this.setState({ currentLocation: position })
      },
      (error) => {
        console.log(JSON.stringify(error));
      },
        Platform.OS === 'ios'?{ enableHighAccuracy: commonStyles.geoLocation.enableHighAccuracy, timeout: commonStyles.geoLocation.timeout, maximumAge: commonStyles.geoLocation.maximumAge }:null
    );

    bendService.getUser( (error, result) => {
      if( error) {
        console.log(error);
        return;
      }

      this.mounted && this.setState({
        user: result,
      })
    })
  }

  componentWillUnmount(){
    this.mounted = false
  }

  onBack () {
    Actions.pop()
  }

  onGetDirection() {
    var url = 'http://maps.apple.com/?ll=' + this.props.volunteer._geoloc[1] + ',' + this.props.volunteer._geoloc[0];
    Linking.openURL(url);
  }

  onGoWeb() {
    var url = UtilService.fixUrl(this.props.volunteer.url);
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

  onCheckIn() {
    this.mounted && this.setState({
      hoursNumber: "0",
      modalVisible: true,
    })
  }

  onCheckInDo() {
    bendService.captureActivityForVolunteer(this.props.volunteer._id, 'volunteer_opportunity', Number(this.state.hoursNumber || 0 ), (error, result) => {
      if (error) {
        console.log(error);
        return;
      }
      this.props.commonActions.getCurrentUserProfile();

      this.mounted && (this.state.activityId = result.activity._id);

      this.mounted && this.setState({
        modalVisible: false,
        didStatus: true,
        showAnimiation: true
      })

      bendService.logActivityView(this.props.volunteer._id, 'volunteer_opportunity', 'did');

      UtilService.mixpanelEvent(
          "Volunteered",
          {
            hours:Number(this.state.hoursNumber || 0),
            category:UtilService.getCategoryName(this.props.volunteer.categories),
            challenge:(this.existChallenge?true:false),
            points:Math.max(this.props.volunteer.points || 1, 1)
          }
      )
    })
  }

  onUncheckIn() {
    bendService.removeActivity(this.state.activityId, (error, result) => {
      if (error){
        console.log(error);
        return;
      }
      this.props.commonActions.getCurrentUserProfile();

      this.mounted && (this.state.activityId = null);

      this.mounted && this.setState({
        didStatus: false,
        showAnimiation: false,
      })
    })
  }

  renderCoverImage() {
    let {
      volunteer
    } = this.props;

    let coverImage, backgroundColor;
    let imageObj = volunteer.coverImage ? volunteer.coverImage : this.category.coverImage;
    coverImage = UtilService.getLargeImage(imageObj);
    backgroundColor = UtilService.getBackColor(imageObj);

    if (coverImage == null) 
      return null;

    return (
      <Image style={ [styles.map, { backgroundColor: backgroundColor }] } source={{ uri: coverImage }}/>
    );
  }

  setModalVisible(visible) {
    this.mounted && this.setState({ modalVisible: visible });
  }

  onPin() {
    if (this.state.pinned) {
      bendService.unpinActivity({
        type: 'volunteer_opportunity',
        id: this.props.volunteer._id,
        name: this.props.volunteer.name,
      }, (error, result) => {
        if (!error) {
          this.mounted && this.setState({
            pinned: false,
          });
          this.props.commonActions.updateRecentPinnedActivities();
          this.props.commonActions.updateAllPinnedActivities();
        }
      });
    } else {
      bendService.pinActivity({
        type: 'volunteer_opportunity',
        id: this.props.volunteer._id,
        name: this.props.volunteer.name,
      }, (error, result) => {
        if (!error) {
          this.mounted && this.setState({
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
      volunteer,
      modal,
    } = this.props;

    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ (modal ? commonStyles.NavCloseButton : commonStyles.NavBackButton) | commonStyles.NavPinButton }
          onBack={ this.onBack }
          title = {volunteer.name}
          isPin = { this.state.pinned }
          onPin = { () => this.onPin() }
        />
        <ScrollView>
          { volunteer.coverImage && this.renderCoverImage() }
          { !volunteer.coverImage && volunteer._geoloc && <MapView
            style={ styles.map }
            initialRegion={{
              latitude: Number(volunteer._geoloc[1]),
              longitude: Number(volunteer._geoloc[0]),
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            }}
              scrollEnabled={ false }
              zoomEnabled={ false }
          >
            {
              <MapView.Marker
                image={ map_pin }
                style={ styles.map_pin }
                coordinate={{
                  latitude: Number(volunteer._geoloc[1]),
                  longitude: Number(volunteer._geoloc[0]),
                }}
              />
            }
          </MapView>}
          { !volunteer.coverImage && !volunteer._geoloc && this.renderCoverImage() }
          <View style={ styles.mainContentContainer }>
            <View style={ styles.infoContainer }>
              <Image style={ styles.imageIcon } source={ UtilService.getCategoryIconFromSlug(volunteer) } />
              <View style={ styles.infoSubContainer }>
                <Text style={ styles.textTitle }>{ volunteer.name }</Text>
                { this.state.currentLocation && <Text style={ styles.textValue }>
                  { volunteer._geoloc ? UtilService.getDistanceFromLatLonInMile(volunteer._geoloc[1],volunteer._geoloc[0],
                      this.state.currentLocation.coords.latitude, this.state.currentLocation.coords.longitude) + ' Miles' : '' }
                  </Text> 
                }
              </View>
              <Point point={ Math.max(volunteer.points || 1, 1) }/>
            </View>
            <View style={ styles.individualInfoContainer }>
              <View style={ styles.addressContainer }>
                <Text style={ styles.textAddress }>{ volunteer.address1 } { volunteer.address2 }</Text>
                <Text style={ styles.textAddress }>{ UtilService.getCityStateString(volunteer.city, volunteer.state, volunteer.postalCode) }</Text>
                { UtilService.isValid(volunteer._geoloc) && <TouchableOpacity onPress={ () => this.onGetDirection() }>
                  <Text style={ styles.textTitle }>Get Directions</Text>
                </TouchableOpacity> }
              </View>
              <View style={ styles.visitContainer }>
                { UtilService.isValidURL(volunteer.url) && <TouchableOpacity onPress={ () => this.onGoWeb() }>
                  <View style={ styles.visitCellContainer }>
                    <Image style={ styles.imageVisit } source={ web } />
                    <Text style={ styles.textInfoTitle }>Web</Text>
                  </View>
                </TouchableOpacity>}
              </View>
            </View>

            { UtilService.isValid(volunteer.startsAt) && UtilService.isValid(volunteer.endsAt) && <View style={ styles.dateContinaer }>
              <View style={ styles.dayWrapper }>
                <Text style={ styles.textDay }>{ UtilService.getDayByTs(volunteer.startsAt) }</Text>
              </View>
              <View style={ styles.dateSubContentContainer }>
                <Text style={ styles.textDate }>{ UtilService.formatDateWithFormat2(new Date(volunteer.startsAt/1000000), 'MMMM DD, YYYY') }</Text>
                <Text style={ styles.textValue }>{ UtilService.getEventTimeByTs(volunteer.startsAt, volunteer.endsAt) }</Text>
              </View>
            </View> }

            <Text style={ styles.textDescription }>{ volunteer.description }</Text>
          </View>
          { volunteer.tags && (volunteer.tags.length > 0) && <View style={ styles.tagsContainer }>
            <Text style={ styles.textHeading }>Tags</Text>
            <View style={ styles.tagsButtonContainer }>
              {
                volunteer.tags.map( (obj, index)=>{
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
            <Text style={ styles.textButton }>I Did It</Text>
          </View>
        </TouchableOpacity> }
        { !this.state.loading && this.state.didStatus && <TouchableOpacity onPress={ () => this.onUncheckIn() }>
          <View style={ styles.buttonGrey }>
            <Text style={ styles.textOrange }>I Didn't Do It</Text>
          </View>
        </TouchableOpacity> }
        {<EarnedPoint show={ this.state.showAnimiation } point={Math.max(volunteer.points || 1, 1)}/>}
        <Modal
          animationType={ "slide" }
          transparent={ false }
          visible={ this.state.modalVisible }
          onRequestClose={ () => { alert("Modal has been closed.") }}
        >
          <View style={ styles.modalContainer }>
            <View style={ styles.modalContentWrapper }>
              <Text style={ styles.modalTextSettingsSection }>Number of Hours Volunteered</Text>
              <TextField
                autoCorrect={ false }
                inputStyle={ inputStyle }
                wrapperStyle={ wrapperStyle }
                onChangeText={ (text) => { this.state.hoursNumber = text }}
                height={ 72 }
                borderColor="transparent"
                value={ this.state.hoursNumber }
              />
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={ () => this.setModalVisible(false) }>
                <View style={ styles.modalCancelButton }>
                  <Text style={ styles.textOrange }>Cancel</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={ () => this.onCheckInDo() }>
                <View style={ styles.modalSubmitButton }>
                  <Text style={ styles.modalTextWhite }>Submit</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default connect(state => ({
  status: state.search.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(volunteerDetailActions, dispatch),
    commonActions: bindActionCreators(commonActions, dispatch),
  })
)(VolunteerDetail);

const inputStyle = {
  color: '#fff',
  fontFamily: 'OpenSans-Semibold',
  fontSize: 72,
  backgroundColor:'transparent',
  textAlign:'center',
  borderWidth:0
};

const wrapperStyle={
  height: 100,
  backgroundColor: 'transparent',
  borderWidth:0,
  width:commonStyles.screenWidth
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: commonStyles.screenWidth,
    height: commonStyles.hp(21),
  },
  mainContentContainer: {
    paddingLeft: 20,
    paddingRight: 16,
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
  textValue: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 12,
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
  individualInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  addressContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  textAddress: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 12,
  },
  visitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInfoTitle: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 12,
    paddingTop: 5,
  },
  visitCellContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 5,
  },
  imageVisit: {
    height: 48,
    width: 48,
  },
  dateContinaer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  dayWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: commonColors.line,
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  textDay: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  dateSubContentContainer: {
    paddingLeft: 8,
  },
  textDate: {
    color: commonColors.question,
    fontFamily: 'Open Sans',
    fontSize: 12,
    backgroundColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#8ED0C4',
  },

  modalContentWrapper:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  modalTextSettingsSection: {
    color: 'white',
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    marginBottom: 80,
  },
  modalTextWhite: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
  },
  modalSubmitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5E8AA3',
    height: 40,
    width:commonStyles.screenWidth/2,
  },
  modalCancelButton: {
    width:commonStyles.screenWidth/2,
    backgroundColor: '#EFEFEF',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonContainer:{
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
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

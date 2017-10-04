'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  Switch,
  Linking,
  Alert,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as profileActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';

import EntypoIcon from 'react-native-vector-icons/Entypo';
import NavTitleBar from '../../components/navTitleBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';
var Mailer = require('NativeModules').RNMail; 
import DeviceInfo from 'react-native-device-info';
import codePush from "react-native-code-push";

import bendService from '../../bend/bendService'
import UtilService from '../../components/util'

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allowOthersToSeeMyActivity: true,
      pushNotifications: true,
      user: bendService.getActiveUser(),
      label: null,
   };
  }

  componentDidMount() {
    this.hasMounted = true
    /*codePush.getUpdateMetadata().then( (metadata) => {
      if (metadata === undefined) {
        return;
      }

      this.hasMounted && this.setState({ label: metadata.label });
    });*/

    if (this.props.subTwo === 'feedback') {
      this.onSendUsYourFeedback();
    } else if (this.props.subTwo === 'suggest') {
      this.onSuggestBusinessOrEvent();
    }

    UtilService.mixpanelEvent("Viewed Settings")
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  onBack() {
    Actions.pop();
  }

  onEditProfile() {
    Actions.EditProfile();
  }

  onChangePassword() {
    Actions.ChangePassword();
  }

  onShareThisApp() {
    alert( 'Tapped onShareThisApp');
  }

  onSendUsYourFeedback() {
    // Mailer.mail({
    //   subject: 'Feedback on MilkCrate for Communities',
    //   recipients: ['info@mymilkcrate.com'],
    //   body: '',
    // }, (error, event) => {
    //   if(error) {
    //     Alert.alert('Cannot Send E-mail', 'Please email us directly at info@mymilkcrate.com');
    //   }

    //   UtilService.mixpanelEvent("Send Feedback")
    // });
    Actions.SendFeedbackModal();
  }

  onSuggestBusinessOrEvent() {
    Mailer.mail({
      subject: 'Suggest a Business, Event, Volunteer Opportunity or Service',
      recipients: ['support@mymilkcrate.com'],
      body: '',
    }, (error, event) => {
      if(error) {
        Alert.alert('Cannot Send E-mail', 'Please email us directly at info@mymilkcrate.com');
      }

      UtilService.mixpanelEvent("Suggested an Activity")
    });
  }

  openURL(url) {
    Linking.canOpenURL(url).then( supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Can't handle url: " + url);
      }
    });
  }

  onAboutMilkCrate() {
    this.openURL('http://www.mymilkcrate.com');
    UtilService.mixpanelEvent("Viewed About Milkcrate")
  }

  onPrivacyPolicy() {
    this.openURL('http://mymilkcrate.com/privacy-policy/');
    UtilService.mixpanelEvent("Viewed Privacy Policy")
  }

  onTermsOfUse() {
    this.openURL('http://mymilkcrate.com/terms-of-use/');
    UtilService.mixpanelEvent("Viewed Terms")
  }

  onSoftwareLicenses() {
    this.openURL('http://mymilkcrate.com/software-licenses/');
    UtilService.mixpanelEvent("Viewed Software Licenses")
  }

  onLogOut() {
    //alert( 'Tapped onLogOut');
    bendService.logout();
    Actions.Introduce();
  }

  updateShareActivity(val) {
    this.state.user.shareActivity = val;

    this.hasMounted && this.setState({
      shareActivity: val
    })

    bendService.updateUser(this.state.user, (error, result) => {
      if (error) {
        console.log(error);
        return;
      }
      UtilService.mixpanelEvent("Toggled Privacy", {"state":this.state.user.shareActivity?'on':'off'})

      console.log("User updated")
    })
  }

  updateAllowNotification(val) {
    this.state.user.allowNotifications = val;

    this.hasMounted && this.setState({
      allowNotifications: val,
    })

    bendService.updateUser(this.state.user, (error, result)=>{
      if (error) {
        console.log(error);
        return;
      }
      UtilService.mixpanelEvent("Toggled Notification", {"state":this.state.user.allowNotifications?'on':'off'})
      console.log("User updated");
    })
  }

  onPlayIntroVideo() {
    Actions.VideoPlayModal();
  }

  render() {
    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ commonStyles.NavBackButton }
          onBack={ this.onBack }
          title="Settings"
        />
        <ScrollView
          style={ styles.scrollView }
        >
          {/* Settings */}
          <Text style={ styles.textSettingsSection }>Settings</Text>
          <TouchableHighlight onPress={ () => this.onEditProfile() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>Edit profile</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={ () => this.onChangePassword() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>Change password</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>

          <View style={ styles.cellContainer }>
            <Text style={ styles.textCellTitle }>Allow others to see my activity</Text>
            <Switch
              onValueChange={ (value) => { this.updateShareActivity(value) }}
              value={ this.state.user.shareActivity }
            />
          </View>
          <View style={ styles.cellContainer }>
            <Text style={ styles.textCellTitle }>Push notifications</Text>
            <Switch
              onValueChange={ (value) => { this.updateAllowNotification(value) }}
              value={ this.state.user.allowNotifications }
            />
          </View>
          <View style={ styles.line }/>

          {/* Communicate */}
          <Text style={ styles.textOtherSection }>Communicate</Text>
          { false && <TouchableHighlight onPress={ () => this.onShareThisApp() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>Share this app</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>}
          <TouchableHighlight onPress={ () => this.onSendUsYourFeedback() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>Send us your feedback!</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={ () => this.onSuggestBusinessOrEvent() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>Suggest a business or event</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>
          <View style={ styles.line }/>

          {/* About */}
          <Text style={ styles.textOtherSection }>About</Text>
          <TouchableHighlight onPress={ () => this.onAboutMilkCrate() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>About MilkCrate</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={ () => this.onPrivacyPolicy() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>Privacy Policy</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={ () => this.onTermsOfUse() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>Terms of Use</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={ () => this.onSoftwareLicenses() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>Software Licenses</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={ () => this.onPlayIntroVideo() }>
            <View style={ styles.cellContainer }>
              <Text style={ styles.textCellTitle }>Watch Intro Video</Text>
              <EntypoIcon name="chevron-thin-right" size={ 15 } color={ commonColors.title }/>
            </View>
          </TouchableHighlight>
          <View style={ styles.line }/>

          {/* Logout */}
          <TouchableOpacity onPress={ () => this.onLogOut() }>
            <View style={ styles.logoutButtonWrapper }>
              <Text style={ styles.textLogOut }>Log Out</Text>
            </View>
          </TouchableOpacity>

          <View style={ styles.versionContainer }>
            <Text style={ styles.textVersion }>MilkCrate for Communities v{ DeviceInfo.getVersion() } ({ this.state.label ? (DeviceInfo.getBuildNumber(), this.state.label) : DeviceInfo.getBuildNumber() })</Text>
          </View>

        </ScrollView>
      </View>
    );
  }
}

export default connect(state => ({
  status: state.profile.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(profileActions, dispatch)
  })
)(Settings);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    backgroundColor: 'transparent',
  },
  textSettingsSection: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    marginTop: 40,
    marginLeft: 8,
    marginBottom: 8,
  },
  textOtherSection: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    marginTop: 16,
    marginLeft: 8,
    marginBottom: 8,
  },
  cellContainer: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
  },
  line: {
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
  },
  textCellTitle: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  logoutButtonWrapper: {
    height: 56,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    marginTop: 24,
  },
  textLogOut: {
    color: commonColors.bottomButton,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
  },
  versionContainer: {
    // backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  textVersion: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 12,
  },

});

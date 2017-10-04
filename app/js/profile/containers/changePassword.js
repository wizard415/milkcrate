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
  TextInput,
  Alert,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as profileActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';

import TextField from 'react-native-md-textinput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import NavTitleBar from '../../components/navTitleBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'

class ChangePassword extends Component {

  constructor(props) {
    super(props);

    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  onBack() {
    Actions.pop();
  }

  onUpdatePassword() {
    if (this.currentPassword == '') {
      alert("Please input current password");
      return;
    }
    if (this.newPassword == '') {
      alert("Please input new password");
      return;
    }
    if (this.confirmNewPassword != this.newPassword) {
      alert("Password doesnot match");
      return;
    }

    bendService.updatePassword(this.currentPassword, this.newPassword, (error, result) => {      
      if (error) {
        if (error == 1) {
          alert("Unknown error")
        } else if(error == 2) {
          alert("Current password is incorrect")
        }        
      } else {
        alert("Password changed")
        UtilService.mixpanelEvent("Changed Password")

      }
    })
  }

  render() {
    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ commonStyles.NavBackButton }
          onBack={ this.onBack }
          title ='Change Password'
        />
        <KeyboardAwareScrollView style={ styles.scrollView }>
          <Text style={ styles.textSettingsSection }>Current Password</Text>
          <TextField
            label='Current Password'
            autoCorrect={ false }
            inputStyle={ inputStyle }
            labelStyle={ labelStyle }
            wrapperStyle={ wrapperStyle }
            highlightColor='#fff'
            borderColor='#fff'
            secureTextEntry={ true }
            onChangeText={ (text) => { this.currentPassword = text }}
          />
          <Text style={ styles.textOtherSection }>New Password</Text>
          <TextField
            label='New Password'
            autoCorrect={ false }
            inputStyle={ inputStyle }
            labelStyle={ labelStyle }
            wrapperStyle={ wrapperStyle }
            highlightColor='#fff'
            borderColor='#fff'
            secureTextEntry={ true }
            onChangeText={ (text) => { this.newPassword = text }}
          />
          <TextField
            label='Confirm New Password'
            autoCorrect={ false }
            inputStyle={ inputStyle }
            labelStyle={ labelStyle }
            wrapperStyle={ wrapperStyle }
            highlightColor='#fff'
            borderColor='#fff'
            secureTextEntry={ true }
            onChangeText={ (text) => { this.confirmNewPassword = text }}
          />
          <View style={ styles.line }/>
          <TouchableOpacity onPress={ () => this.onUpdatePassword() }>
            <View style={ styles.updatePasswordButtonWrapper }>
              <Text style={ styles.textUpdatePassword }>Update Password</Text>
            </View>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
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
)(ChangePassword);

const inputStyle = {
  color: commonColors.grayText,
  fontFamily: 'OpenSans-Semibold',
  fontSize: 14,
  paddingHorizontal: 16,
};

const labelStyle={
  color: commonColors.grayMoreText,
  fontFamily: 'Open Sans',
  fontSize: 12,
  paddingHorizontal: 16,
};

const wrapperStyle={
  height: 72,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: commonColors.line,
};

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
  line: {
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
  },
  updatePasswordButtonWrapper: {
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
  textUpdatePassword: {
    color: '#82ccbe',
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
  },
});

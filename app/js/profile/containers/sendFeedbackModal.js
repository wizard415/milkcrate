'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Keyboard,
  Alert,
  KeyboardAvoidingView
} from 'react-native';

import Spinner from 'react-native-loading-spinner-overlay';

import { Actions } from 'react-native-router-flux';
import bendService from '../../bend/bendService'
import Cache from '../../components/Cache'
import DeviceInfo from 'react-native-device-info';

import NavTitleBar from '../../components/navTitleBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';

export default class SendFeedbackModal extends Component {

  constructor(props) {
    super(props);

    this.state =  {
      textFeedback: "",
      sending: false,
    }
  }

  componentDidMount() {
    this.hasMounted = true
  }

  componentDidMount() {
    this.hasMounted = false
  }

  onClose() {
    Keyboard.dismiss();
    Actions.pop();
  }

  onSendUsYourFeedback() {
    console.log("here")
    if (this.state.textFeedback === '') {
      return;
    }
    
    Keyboard.dismiss();

    this.hasMounted && this.setState({ sending: true });
    bendService.sendFeedback( {
      feedback:this.state.textFeedback,
      deviceName: DeviceInfo.getDeviceName(),
      deviceModel: DeviceInfo.getModel(),
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      deviceVersion: DeviceInfo.getDeviceId(),
      client:Cache.community.name,
    }, (error, result) => {
      console.log("sendFeedback", error, result)
      this.hasMounted && this.setState({ sending: false });
      if (error) {
        console.log(error);
        return;
      }

      this.onClose();
    })
  }

  render() {

    return (
      <View style={ styles.container }>
        <Spinner visible={ this.state.sending }/>
        <NavTitleBar
          buttons={ commonStyles.NavCloseTextButton | commonStyles.NavSendButton }
          onBack={ () => this.onClose() }
          onSend={ () => this.onSendUsYourFeedback() }
          title={ "Send Feedback" }
        />
        <KeyboardAvoidingView
          behavior='padding'
          style={ styles.keyboardContainer }
        >
          <TextInput
            autoCorrect={ false }
            multiline={ true }
            placeholder="Type your feedback"
            placeholderTextColor={ commonColors.placeholderText }
            textAlign="left"
            style={ styles.input }
            underlineColorAndroid="transparent"
            onChangeText={ (text) => this.setState({ textFeedback: text }) }
          />
        </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({  
  container: {
    flex: 1,
  },  
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    textAlignVertical: 'top',
    fontSize: 16,
    color: commonColors.title,
    padding: 10,    
    backgroundColor: '#fff',    
  },
});

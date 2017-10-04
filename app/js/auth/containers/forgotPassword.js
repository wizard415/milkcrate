'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
  findNodeHandle,
  TouchableWithoutFeedback
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as loginActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';

import Spinner from 'react-native-loading-spinner-overlay';
import timer from 'react-native-timer';
import * as commonColors from '../../styles/commonColors';
import { screenWidth, screenHeight } from '../../styles/commonStyles';
import bendService from '../../bend/bendService';
import UtilService from '../../components/util';

const background = require('../../../assets/imgs/back2.png');
const backImage = require('../../../assets/imgs/back-arrow.png');

class ForgotPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      resetPassword: false,
    };
  }

  componentDidMount() {
    this.hasMounted  = true
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  onReset() {

    Keyboard.dismiss();

    if (this.state.email == '') {
      Alert.alert('Please enter your email address.');
      return;
    }

    bendService.resetPassword(this.state.email, (error, ret)=>{
      console.log(error, ret)
      if(error) {
        return;
      }
      this.hasMounted && this.setState({ resetPassword: true });
      UtilService.mixpanelEvent("Reset Password")
    })
  }

  goBack() {
    Actions.pop()
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={ styles.container } >
        <Image source={ background } style={ styles.background } resizeMode="cover">
          <TouchableOpacity
              activeOpacity={ .5 }
              style={ styles.backImageWrapper }
              onPress={ () => this.goBack() }
          >
            <Image source={ backImage } style={ styles.backImageStyle } resizeMode="cover"></Image>
          </TouchableOpacity>
          {!this.state.resetPassword&&<View style={ styles.inputContainer }>
            <Text style={ [styles.textDescription, {marginTop:-50}] }>Enter the email address associated with your account. We'll send you an email with instructions how to reset your password</Text>
            <TextInput
              ref="email"
              autoCapitalize="none"
              autoCorrect={ false }
              placeholder="Email"
              placeholderTextColor={ commonColors.placeholderText }
              textAlign="center"
              style={ styles.input }
              underlineColorAndroid="transparent"
              returnKeyType={ 'next' }
              keyboardType="email-address"
              value={ this.state.email }
              onChangeText={ (text) => this.setState({ email: text }) }
              onSubmitEditing={ () => this.onReset() }
            />

            <TouchableOpacity
              activeOpacity={ .5 }
              style={ styles.loginButtonWrapper }
              onPress={ () => this.onReset() }
            >
              <View style={ styles.buttonLogin }>
                <Text style={ styles.textButton }>Reset Password</Text>
              </View>
            </TouchableOpacity>
          </View>}
          {this.state.resetPassword&&<View style={ styles.inputContainer }>
            <Text style={styles.textTitle}>Email Sent!</Text>
            <Text style={ styles.textDescription }>We just sent an email to {this.state.email}. It has insructions for how to reset your password.</Text>
            <TouchableOpacity
                activeOpacity={ .5 }
                style={ styles.backButtonWrapper }
                onPress={ () => this.goBack() }
            >
              <View style={ styles.buttonLogin }>
                <Text style={ styles.textButton }>Back to Login</Text>
              </View>
            </TouchableOpacity>
          </View>}
        </Image>
      </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default connect(state => ({
  status: state.auth.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(loginActions, dispatch)
  })
)(ForgotPassword);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  background: {
    width: screenWidth,
    height: screenHeight,
  },
  backImageWrapper: {
    paddingTop:17,
    paddingLeft:17
  },
  backImageStyle: {
    width:12,
    height:12
  },
  inputContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTitle: {
    color: commonColors.title,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    backgroundColor: 'transparent',
    textAlign:'center'
  },
  textDescription: {
    color: commonColors.title,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 12,
    marginBottom:10,
    lineHeight:24,
    backgroundColor: 'transparent',
    marginHorizontal: 40,
    textAlign:'center'
  },
  inputWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  input: {
    fontSize: 14,
    color: commonColors.title,
    height: 45,
    alignSelf: 'stretch',
    marginHorizontal: 40,
    borderColor: '#fff',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 5,
    paddingHorizontal: 30,
  },
  loginButtonWrapper: {
    marginTop: 44,
    alignSelf: 'stretch',
  },
  backButtonWrapper: {
    alignSelf: 'stretch',
  },
  buttonLogin: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: commonColors.theme,
    borderRadius: 4,
    borderWidth: 4,
    borderColor: commonColors.theme,
    borderStyle: 'solid',
    marginHorizontal: 40,
    height: 40
  },
  textButton: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
});

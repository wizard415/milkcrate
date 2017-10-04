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

const background = require('../../../assets/imgs/background_profile.png');
const eye = require('../../../assets/imgs/eye.png');
const eye_slash = require('../../../assets/imgs/eye_slash.png');

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      bShowConfirmPassword: true,
      loggingIn: false,
    };
  }

  componentDidMount() {
    this.hasMounted = true
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  onLogin() {

    Keyboard.dismiss();

    if (this.state.email == '') {
      Alert.alert('Please enter your email address.');
      return;
    }

    if (this.state.password == '') {
      Alert.alert('Please enter your password.');
      return;
    }

    this.hasMounted && this.setState({ loggingIn: true });

    bendService.login(this.state.email, this.state.password, (error, user)=>{

      this.hasMounted && this.setState({ loggingIn: false });
      console.log('User: ', JSON.stringify(user))
      if (error || !user.enabled) {

        this.hasMounted && this.setState({
          password: '',
        });

        timer.setTimeout( this, 'LoginFailed', () => {
          timer.clearTimeout(this, 'LoginFailed');
          Alert.alert("Invalid credentials. Please check your email and password and try again.")
        }, 200);

        return
      }

      bendService.getCommunity((err, ret)=>{
        if(!err) {
          if(ret.enableDomainRestrictions) {
            var domains = ret.whitelistedDomains||[]
            var userDomain = user.email.substr(user.email.indexOf('@') + 1);
            userDomain = userDomain.toLowerCase()

            //console.log("domains", domains, userDomain)
            if(domains.indexOf(userDomain) == -1) {
              //doesnot exist in whitelist so that logout
              bendService.logout()

              timer.setTimeout( this, 'LoginFailed', () => {
                timer.clearTimeout(this, 'LoginFailed');
                Alert.alert("Your email address is not authorized for this community.")
              }, 200);

              return;
            }
          }          
          UtilService.mixpanelIdentify(user._id);
          UtilService.mixpanelSetProperty({
            'email':user.email,
            'name':user.name,
            'totalPoints':user.points
          });

          //Cache.setMapData("points", activeUser.points)

          UtilService.mixpanelSetProperty({
            'client':ret.name
          });
          UtilService.mixpanelEvent("Logged In", {"name":user.name})
          //check community code
          if (!user.name) {
            Actions.SetupProfile();
          } else {
            Actions.Main();
          }
        } else {
          bendService.logout()

          timer.setTimeout( this, 'LoginFailed', () => {
            timer.clearTimeout(this, 'LoginFailed');
            Alert.alert("Invalid community.")
          }, 200);
        }
      })
    })
  }

  onForgotPassword() {
    Actions.ForgotPassword();
  }

  onCreateAccount() {
    Actions.Signup({ showLogIn: true });
  }

  onToggleConfirmPassword() {
    this.hasMounted && this.setState({ bShowConfirmPassword: !this.state.bShowConfirmPassword });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={ styles.container } >
        <Spinner visible={ this.state.loggingIn }/>
        <Image source={ background } style={ styles.background } resizeMode="cover">
          <View style={ styles.descriptionContainer }>
            <Text style={ styles.textTitle }>Log In</Text>
            <Text style={ styles.textDescription }>Welcome back!</Text>
            <Text style={ styles.textDescription }>If you don’t have an account you’ll need to </Text>
            <Text style={ styles.textDescription }>create one.</Text>
          </View>
          <View style={ styles.inputContainer }>
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
              onSubmitEditing={ () => this.refs.password.focus() }
            />
            <View style={ styles.inputWrapper }>
              <TextInput
                ref="password"
                autoCapitalize="none"
                autoCorrect={ false }
                placeholder="Password"
                secureTextEntry={ this.state.bShowConfirmPassword }
                placeholderTextColor={ commonColors.placeholderText }
                textAlign="center"
                style={ styles.input }
                underlineColorAndroid="transparent"
                returnKeyType={ 'go' }
                value={ this.state.password }
                onChangeText={ (text) => this.setState({ password: text }) }
                onSubmitEditing={ () => this.onLogin() }
              />
              <TouchableOpacity
                activeOpacity={ .5 }
                style={ styles.eyeButtonWrapper }
                onPress={ () => this.onToggleConfirmPassword() }
              >
                <Image source={ this.state.bShowConfirmPassword ? eye : eye_slash } style={ styles.imageEye }/>
              </TouchableOpacity>
            </View>
            <View style={ styles.buttonWrapper }>
              <TouchableOpacity
                activeOpacity={ .5 }
                onPress={ () => this.onForgotPassword() }
              >
                <Text style={ styles.textTitleButton }>Forgot Password</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={ .5 }
              style={ styles.loginButtonWrapper }
              onPress={ () => this.onLogin() }
            >
              <View style={ styles.buttonLogin }>
                <Text style={ styles.textButton }>Log In</Text>
              </View>
            </TouchableOpacity>

            <View style={ styles.buttonWrapper }>
              <TouchableOpacity
                activeOpacity={ .5 }
                onPress={ () => this.onCreateAccount() }
              >
                <Text style={ styles.textTitleButton }>Create Account</Text>
              </TouchableOpacity>
            </View>

          </View>
          <View style={ styles.bottomContainer }/>
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
)(Login);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: screenWidth,
    height: screenHeight,
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  inputContainer: {
    flex: 1.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  bottomContentWrap: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 10,
  },
  textTitle: {
    color: commonColors.title,
    fontFamily: 'Blanch',
    fontSize: 48,
    backgroundColor: 'transparent',
  },
  textDescription: {
    color: commonColors.title,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 12,
    paddingTop: 5,
    backgroundColor: 'transparent',
  },
  textInvite: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 12,
    paddingVertical: 5,
    backgroundColor: 'transparent',
  },
  imageEye: {
    width: 20,
    height: 13,
  },
  eyeButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'absolute',
    right: 40,
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
    marginTop: 16,
    alignSelf: 'stretch',
  },
  buttonWrapper: {
    marginTop: 16,
    alignItems: 'center',
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
    height: 40,
  },
  textButton: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  textTitleButton: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
});

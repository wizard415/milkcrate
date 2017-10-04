import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

import { screenWidth } from '../styles/commonStyles';
import * as commonColors from '../styles/commonColors';
import * as commonStyles from '../styles/commonStyles';
import EvilIcon from 'react-native-vector-icons/EvilIcons';

const back_arrow = require('../../assets/imgs/back_arrow.png');
const filter = require('../../assets/imgs/filter.png');
const setting = require('../../assets/imgs/setting.png');
const pin = require('../../assets/imgs/pin.png');
const unpin = require('../../assets/imgs/unpin.png');

export default class NavTitleBar extends Component {

  static propTypes = {
    onBack: PropTypes.func,
    onFilter: PropTypes.func,
    onSetting: PropTypes.func,
    onSend: PropTypes.func,
    title: PropTypes.string,
    buttons: PropTypes.number,
    isPin: PropTypes.bool,
  }

  static defaultProps = {
    onBack: () => {},
    onFilter: () => {},
    onSetting: () => {},
    onSend: () => {},
    onPin:() => {},
    title: 'Title',
    buttons: commonStyles.NavNoneButton,
    isPin: false
  }

  constructor(props) {
    super(props);
    this.onBack = this.onBack.bind(this);
    this.onFilter = this.onFilter.bind(this);
    this.onSetting = this.onSetting.bind(this);
    this.onSend = this.onSend.bind(this);
  }

  onBack() {
    if (this.props.onBack) {
      this.props.onBack();
    }
  }

  onFilter() {
    if (this.props.onFilter) {
      this.props.onFilter();
    }
  }

  onSetting() {
    if (this.props.onSetting) {
      this.props.onSetting();
    }
  }

  onSend() {
    if (this.props.onSend) {
      this.props.onSend();
    }
  }

  onPin() {
    if (this.props.onPin) {
      this.props.onPin();
    }
  }

  get renderLeftButton() {
    const {
      buttons,
    } = this.props;

    if (buttons & commonStyles.NavBackButton) {
      return (
        <View style={ styles.buttonWrap }>
          <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onBack() }>
            <View style={ styles.button }>
               <Image source={ back_arrow } style={ styles.image }/>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (buttons & commonStyles.NavCloseButton) {
      return (
        <View style={ styles.buttonWrap }>
          <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onBack() }>
            <View style={ styles.button }>
              <EvilIcon name="close" size={ 28 } color='#fff'/>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (buttons & commonStyles.NavCloseTextButton) {
      return (
        <View style={ styles.buttonWrap }>
          <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onBack() }>
            <View style={ styles.button }>
              <Text style={ styles.textButton }>Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={ styles.titleBarPadding }/>          
    );
  }

  get renderRightButton() {
     const {
      buttons,
      isPin,
    } = this.props;

    if (buttons & commonStyles.NavPinButton) {
      return (
          <View style={ styles.buttonWrap }>
            <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onPin() }>
              <View style={ styles.button }>
                <Image source={ isPin ? pin: unpin } style={ isPin ? styles.imagePin: styles.imageUnpin }/>
              </View>
            </TouchableOpacity>
          </View>
      );
    }

    if (buttons & commonStyles.NavFilterButton) {
      return (
        <View style={ styles.buttonWrap }>
          <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onPin() }>
            <View style={ styles.button }>
              <Image source={ filter } style={ styles.image }/>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (buttons & commonStyles.NavSettingButton) {
      return (
        <View style={ styles.buttonWrap }>
          <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onSetting() }>
            <View style={ styles.button }>
              <Image source={ setting } style={ styles.image }/>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    
   if (buttons & commonStyles.NavSendButton) {
      return (
        <View style={ styles.buttonWrap }>
          <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onSend() }>
            <View style={ styles.button }>
              <Text style={ styles.textButton }>Send</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return(
      <View style={ styles.titleBarPadding }/>
    );
  }

  render() {
    const {
      title,
    } = this.props;

    return (
      <View style={ styles.container }>
        <View style={ styles.navigationBarWrap }>
          { this.renderLeftButton }
          <View style={ styles.titleBarWrap }>
            <Text numberOfLines={ 1 } style={ styles.textTitle }>{ title }</Text>
          </View>
          { this.renderRightButton }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  navigationBarWrap: {
    flexDirection: 'row',
    backgroundColor: commonColors.theme,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#00000021',
    height: (Platform.OS === 'android') ? 44 : 64,
    paddingTop: (Platform.OS === 'android') ? 0 : 20,
  },
  titleBarWrap: {
    flex : 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBarPadding: {
    flex: 1,
  },
  textTitle: {
    color: '#fff',
    fontFamily: 'Blanch',
    fontSize: 28,
    textAlign: 'center',
  },
  buttonWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    width: screenWidth * 0.1428,
    height: screenWidth * 0.12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 14,
    height: 14,
  },
  textButton: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  imagePin: {
    width: 13,
    height: 19,
  },
  imageUnpin: {
    width: 18,
    height: 18,
  },

});
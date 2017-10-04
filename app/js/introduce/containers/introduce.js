'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';

import { Actions } from 'react-native-router-flux';

import AppIntro from '../components/AppIntro';
import Signup from '../../auth/containers/signup';
import Orientation from 'react-native-orientation';

import * as commonStyles from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';

const background1 = require('../../../assets/imgs/introduce/background_introduce1.png');
const background2 = require('../../../assets/imgs/introduce/background_introduce2.png');
const background3 = require('../../../assets/imgs/introduce/background_introduce3.png');
const background4 = require('../../../assets/imgs/introduce/background_introduce4.png');
const background5 = require('../../../assets/imgs/introduce/background_introduce5.png');
const background6 = require('../../../assets/imgs/introduce/background_introduce6.png');

export default class Introduce extends Component {
  constructor(props) {
    super(props);

    StatusBar.setHidden(true);
  }

  componentDidMount() {
    this.hasMounted = true
    Orientation.lockToPortrait();
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  onGoLogin() {
    Actions.Login();
  }

  render() {
    return (
      <View style={ styles.container }>
        <AppIntro
          skipBtnLabel="Log In"
          nextBtnLabel="Next"
          doneBtnLabel=""
          rightTextColor={ commonColors.title }
          leftTextColor={ commonColors.title }
          dotColor= { commonColors.line }
          activeDotColor={ commonColors.title }
          customStyles={ customStyles }
          onSkipBtnClick={ (position) => this.onGoLogin() }
          onDoneBtnClick={ () => this.onGoLogin() }
        >
          <View style={ styles.slide }>
            <Image source={ background1 } style={ styles.background } resizeMode="cover">
              <View style={ styles.paddingTop }></View>
              <View style={ styles.contentWrap }>
                <Text style={ styles.description }>Let your sustainable journey begin –</Text>
                <Text style={ styles.description }>and get ready to earn rewards</Text>
                <Text style={ styles.description }>for making an impact!</Text>
              </View>
              <View style={ styles.paddingBottom }></View>
            </Image>
          </View>
          <View style={ styles.slide }>
            <Image source={ background2 } style={ styles.background } resizeMode="cover">
              <View style={ styles.paddingTop }></View>
              <View style={ styles.contentWrap }>
                <Text style={ styles.title }>DISCOVER BUSINESSES</Text>
                <Text style={ styles.description }>Earn points for checking in to </Text>
               <Text style={ styles.description }>hundreds of sustainable businesses</Text>
                <Text style={ styles.description }>in your neighborhood.</Text>
              </View>
              <View style={ styles.paddingBottom }></View>
            </Image>
          </View>
          <View style={ styles.slide }>
            <Image source={ background3 } style={ styles.background } resizeMode="cover">
              <View style={ styles.paddingTop }></View>
              <View style={ styles.contentWrap }>
                <Text style={ styles.title }>TAKE ACTION</Text>
                <Text style={ styles.description }>See your points increase as you take part</Text>
                <Text style={ styles.description }>in weekly challenges and for completing</Text>
                <Text style={ styles.description }>activities throughout the week.</Text>
              </View>
              <View style={ styles.paddingBottom }></View>
            </Image>
          </View> 
          <View style={ styles.slide }>
            <Image source={ background4 } style={ styles.background } resizeMode="cover">
              <View style={ styles.paddingTop }></View>
              <View style={ styles.contentWrap }>
                <Text style={ styles.title }>GET INVOLVED</Text>
                <Text style={ styles.description }>Explore amazing local volunteer</Text>
                <Text style={ styles.description }>opportunities and green-themed events.</Text>
              </View>
              <View style={ styles.paddingBottom }></View>
            </Image>
          </View>
          <View style={ styles.slide }>
            <Image source={ background5 } style={ styles.background } resizeMode="cover">
              <View style={ styles.paddingTop }></View>
              <View style={ styles.contentWrap }>
                <Text style={ styles.title }>CELEBRATE WITH REWARDS</Text>
                <Text style={ styles.description }>Use your earned points from all of</Text>
                <Text style={ styles.description }>your activities and challenges on</Text>
                <Text style={ styles.description }>great local rewards.</Text>
              </View>
              <View style={ styles.paddingBottom }></View>
            </Image>
          </View>
          <View style={ styles.slide }>
            <Image source={ background6 } style={ styles.background } resizeMode="cover">
              <View style={ styles.paddingTop }></View>
              <View style={ styles.contentWrap }>
                <Text style={ styles.title }>VIEW YOUR PROGRESS</Text>
                <Text style={ styles.description }>See your individual impact and personal</Text>
                <Text style={ styles.description }>achievements as well as your own community’s</Text>
                <Text style={ styles.description }>overall activity for comparison and competition.</Text>
              </View>
              <View style={ styles.paddingBottom }></View>
            </Image>
          </View>
          <Signup/>
        </AppIntro>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: commonStyles.screenWidth,
    height: commonStyles.screenHeight,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paddingTop: {
    flex: 5,
  },
  paddingBottom: {
    flex: 1,
  },
  contentWrap: {
    flex : 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: commonColors.title,
    fontFamily: 'Blanch',
    fontSize: 48 * commonStyles.scaleScreen(),
  },
  description: {
    color: commonColors.title,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14 * commonStyles.scaleScreen(),
    paddingVertical: 2,
  },
});

const customStyles = {
  dotStyle: {
    backgroundColor: 'rgba(255,255,255,.3)',
    width: 5,
    height: 5,
    borderRadius: 7,
    marginLeft: 7,
    marginRight: 7,
    marginTop: 7,
    marginBottom: 7,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'Open Sans',
  },
  controllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'Open Sans',
  },
};

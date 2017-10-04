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

import { Actions } from 'react-native-router-flux';

import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';

const close = require('../../../assets/imgs/close_button.png');

const description = 'Studies suggest that people could do a lot to slow global warming if they limited how much meat they eat. "Although researchers disagree about exactly how much meat is OK to eat, most agree that less is better," reports the Boston Globe. Our choices relating to what we eat and where to get it undeniably have an impact on the environment. We will offer you suggestions based on your answer that will help you make beneficial changes to your diet. \n\nAnswering this question will help us create customized content just for you! [Earn 5 points!]'

export default class LearnMoreModal extends Component {

  constructor(props) {
    super(props);
  }

  onClose() {
    Actions.pop();
  }

  render() {
    const { 
      question,
    } = this.props;

    return (
      <View style={ styles.container }>
        <View style={ styles.topContainer }/>
        <View style={ styles.centerContainer }>
          <View style={ styles.titleContainer}>
            <Text style={ styles.textTitle }>{ question.topic }</Text>
          </View>
          <View style={ styles.contentContainer }>
            <ScrollView>
              <Text style={ styles.textDescription }>{ question.details }</Text>
            </ScrollView>
          </View>
        </View>
        <View style={ styles.bottomContainer }>
          <View style={ styles.bottomPadding }/>
          <View style={ styles.closeContainer }>
            <TouchableOpacity onPress={ () => this.onClose() }>
              <Image style={ styles.imageClose } source={ close }/>
            </TouchableOpacity>
          </View>
        </View>        
      </View>
    );
  }
}

const styles = StyleSheet.create({  
  container: {
    flex: 1,
    backgroundColor: '#000000c0',
  },
  scrollView: {
    backgroundColor: 'transparent',
  },
  topContainer: {
    flex: 1.5,
    backgroundColor: 'transparent',
  },
  centerContainer: {
    flex: 5,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  bottomContainer: {
    flex: 1.5,
    backgroundColor: 'transparent',
  },
  bottomPadding: {
    flex: 0.5,
  },
  closeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageClose: {
    width: 48,
    height: 48,
  },  
  titleContainer: {
    flex: 1,
    backgroundColor: commonColors.theme,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  contentContainer: {
    flex: 4,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  textTitle: {
    color: '#fff',
    fontFamily: 'Blanch',
    fontSize: 48,
  },
  textDescription: {
    color: commonColors.question,
    fontFamily: 'Open Sans',
    fontSize: 14,
    padding: 24,
  },
});

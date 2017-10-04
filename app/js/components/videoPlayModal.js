'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Platform,
} from 'react-native';

import { Actions } from 'react-native-router-flux';

import * as commonColors from '../styles/commonColors';
import * as commonStyles from '../styles/commonStyles';
import VideoPlayer from './videoPlayer';

export default class VideoPlayModal extends Component {

  constructor(props) {
    super(props);
  }

  onClose() {
    Actions.pop();
  }

  render() {
    let videoPaddingHeight = 0;

    if (Platform.OS === 'android')
      videoPaddingHeight = 20;

    return (
      <View style={ styles.container }>
        <VideoPlayer
          autoplay={ true }
          videoWidth={ commonStyles.screenWidth }
          videoHeight={ commonStyles.screenHeight - videoPaddingHeight }
          video={{ uri: 'http://311223117dc459c19100-ab7ee833adab3aef56dce40975a8acc5.r73.cf1.rackcdn.com/milkcrate-intro.mp4' }}
          onClose={ () => this.onClose() }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({  
  container: {
    flex: 1,
  },
});

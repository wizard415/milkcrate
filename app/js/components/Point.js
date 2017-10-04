import React, { Component, PropTypes } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';

import * as commonColors from '../styles/commonColors';

const point_image = require('../../assets/imgs/point.png');

export default class Point extends Component {

  static propTypes = {
    point: PropTypes.number,
  }

  static defaultProps = {
    point: 0,
  }

  constructor(props) {
    super(props);
  }

  render() {
    const { point } = this.props;

    return (
      <View style={ styles.pointContainer }>
        <Text style={ styles.textPoint }>+{ point }</Text>
        <Image style={ styles.imagePoint } source={ point_image }/>          
      </View>      
    );
  }
}

const styles = StyleSheet.create({
  pointContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePoint: {
    width: 18,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textPoint: {
    backgroundColor: 'transparent',
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginRight: 2,
  },
});
import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

import * as commonColors from '../../styles/commonColors';

export default class CategoryButton extends Component {

  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    icon: PropTypes.number.isRequired,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    onClick: () => {},
  }

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    const {
      height,
      width,
      text,
      icon,
      onClick,
    } = this.props;

    return (
      <View style={ [styles.container, { width, height }] }>
        <TouchableOpacity
          style={ styles.button }
          onPress={ () => onClick() }
        >
          <Image source={ icon } style={ [{ width: width - 20 }, { height: height - 20 }] }/>
          <Text style={ [styles.text, { width: width }, { height: 20 }] }>{ text }</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

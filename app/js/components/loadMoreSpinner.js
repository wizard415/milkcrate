import React, { Component, PropTypes } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import * as commonColors from '../styles/commonColors';

export default class LoadMoreSpinner extends Component {

  static propTypes = {
    show: PropTypes.bool,
    loading: PropTypes.bool,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    show: true,
    loading: false,
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
      show, 
      loading, 
      onClick 
    } = this.props;

    if (show == false)
      return null;

    return (
      <View style={ styles.container }>
        {
          loading ?
            <ActivityIndicator
              hidesWhenStopped={ true }
              animating={ loading }
              style={ styles.activityIndicator }
            />
          :
            <TouchableOpacity activeOpacity={ .5 } onPress={ () => onClick() }>
              <Text style={ styles.textLoadMoreButton }>Load More</Text>
            </TouchableOpacity>          
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems:'center'
  },
  textLoadMoreButton: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  activityIndicator: {
    
  },
});
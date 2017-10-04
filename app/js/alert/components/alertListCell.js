import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableHighlight,
} from 'react-native';

import * as commonStyles from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';

const heart = require('../../../assets/imgs/heart.png');

export default class AlertListCell extends Component {

  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    time: PropTypes.string,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    width: commonStyles.screenWidth,
    height: commonStyles.hp(10),
    onClick: () => {}
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

  showTime( time ) {
    return (
        <Text style={ styles.textSmall }>{time}</Text>
    );
  }

  render() {
    const {
      height,
      width,
      name,
      description,
      avatar,
      time,
      avatarBackColor
    } = this.props;

    return (
      <TouchableHighlight onPress={ () => this.onClick() }>
        <View style={ styles.cellContainer }>
          <View style={ styles.avatarContainer }>
            { (avatar != "") && <Image style={ [styles.avatar, { backgroundColor:avatarBackColor }] } source={{ uri:avatar }}/> }
            { (avatar == "") && <Image style={ styles.avatar } source={ require('../../../assets/imgs/milkcrate.png') }/> }
          </View>
          <View style={ styles.mainContentContainer }>
            <View style={ styles.names_timeContainer }>
              <Text style={ styles.textName }>{ name }</Text>
              { this.showTime (time) }
            </View>
            <Text numberOfLines={ 2 } style={ styles.textDescription }>{ description }</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}
const styles = StyleSheet.create({
  cellContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    height: commonStyles.hp(10),
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    borderStyle: 'solid',
  },
  avatarContainer: {
    justifyContent: 'center',
  },
  mainContentContainer: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  names_timeContainer: {
    flexDirection: 'row',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 2,
  },
  textName: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  textSmall: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 12,
    backgroundColor: 'transparent',
    paddingLeft: 5,
  },
  textDescription: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
});

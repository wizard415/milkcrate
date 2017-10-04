import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';

import { screenWidth } from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';

const chevron_down = require('../../../assets/imgs/chevron_down.png');
const chevron_up = require('../../../assets/imgs/chevron_up.png');

export default class SimpleLeaderboardListCell extends Component {

  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    status: PropTypes.number,
    index: PropTypes.number,
    name: PropTypes.string.isRequired,
    points: PropTypes.number.isRequired,
    avatar: PropTypes.string.isRequired,
    currentUserIndex: PropTypes.number,
  }

  static defaultProps = {
    width: screenWidth,
    height: 32,
    status: 0,
    points: 0,
    currentUserIndex: -1,
  }

  constructor(props) {
    super(props);
  }

  showStatus (status) {
    if (status == 1) {
      return (
        <Image style={ styles.imageStatus } source={ chevron_up }/>
      );
    } else if (status == 2) {
      return (
        <Image style={ styles.imageStatus } source={ chevron_down }/>
      );
    }

    return (
      <View style={ styles.imageStatus } />
    );
  }

  showInfo(isMe, name, points) {
    if (isMe) {
      return (
        <View style={ styles.activeCellInfoContainer }>
          <View style={ styles.secondContainer }>
            <Text style={ styles.textName }>{ name }</Text>
            <Text style={ styles.textPoints }>{ points } points</Text>
          </View>
        </View>  
      );
    } else {
      return (
        <View style={ styles.secondContainer }>
          <Text style={ [styles.textName, { opacity: 0.6 }] }>{ name }</Text>
          <Text style={ [styles.textPoints, { opacity: 0.6 }] }>{ points==1?'1 point':points + ' points' }</Text>
        </View>
      );
    }
  }

  showAvatar( isMe, avatar, avatarBackColor, defaultAvatar) {
    if (avatar != '')
      return (<Image style={ [styles.avatar, {opacity: isMe ? 1 : 0.6}, { backgroundColor:avatarBackColor }] } source={{ uri : avatar }}/>);
    else
      return (<Image style={ [styles.avatar, {opacity: isMe ? 1 : 0.6}] } source={ defaultAvatar }/>);
  }

  render() {
    const {
      height,
      width,
      status,
      index,
      name,
      points,
      avatar,
      currentUserIndex,
      avatarBackColor,
      defaultAvatar,
    } = this.props;

    return (
      <View style={ styles.cellContainer }>
        <View style={ styles.firstContainer }>
          { this.showStatus(status) }
          <Text style={ styles.textIndex }>{ index }</Text>
          { this.showAvatar(currentUserIndex==index, avatar, avatarBackColor, defaultAvatar) }
          { this.showInfo(currentUserIndex==index, name, points) }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cellContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  firstContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  imageStatus: {
    width: 8,
    height: 4,
  },
  textIndex: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 12,
    paddingLeft: 8,
    paddingRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 2,
  },
  secondContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  textName: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textPoints: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  activeCellInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

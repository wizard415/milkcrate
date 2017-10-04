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
import EntypoIcon from 'react-native-vector-icons/Entypo';

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
    currentUser: PropTypes.bool,
    // onClick: PropTypes.func,
  }

  static defaultProps = {
    width: screenWidth,
    height: 32,
    status: 0,
    points: 1,
    currentUser: false,
    // onClick: () => {}
  }

  constructor(props) {

    super(props);
    // this.onClick = this.onClick.bind(this);
  }

  // onClick() {
  //   if (this.props.onClick) {
  //     this.props.onClick();
  //   }
  // }

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

  render() {
    const {
      height,
      width,
      status,
      index,
      name,
      points,
      avatar,
      currentUser,
      onClick,
      avatarBackColor,
      defaultAvatar,
    } = this.props;

    return (
      // <TouchableHighlight onPress={ () => onClick() }>
        <View style={ [styles.cellContainer, currentUser ? { backgroundColor: commonColors.currentUserLeadboardCell } : {}] }>
          <View style={ styles.firstContainer }>
            { this.showStatus(status) }
            <Text style={ styles.textIndex }>{ index }</Text>
            { (avatar != '') && <Image style={ [styles.imageAvatar, { backgroundColor:avatarBackColor }] } source={{ uri:avatar }}/> }
            { (avatar == '') && <Image style={ styles.imageAvatar } source={ defaultAvatar }/> }
            <View style={ styles.secondContainer }>
              <Text style={ styles.textName }>{ name }</Text>
              <Text style={ styles.textPoints }>{ points == 1 ? '1 point' : points + ' points' }</Text>
            </View>
          </View>
        </View>
      // </TouchableHighlight>
    );
  }
}
const styles = StyleSheet.create({
  cellContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
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
  imageAvatar: {
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
});

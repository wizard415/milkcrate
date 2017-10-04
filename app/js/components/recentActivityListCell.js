import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
} from 'react-native';

import * as commonStyles from '../styles/commonStyles';
import * as commonColors from '../styles/commonColors';
import Point from '../components/Point';

const imageHeart = require('../../assets/imgs/heart.png');
const imageRedHeart = require('../../assets/imgs/heart_red.png');

export default class RecentActivityListCell extends Component {

  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    time: PropTypes.string,
    hearts: PropTypes.number,
    likeByMe: PropTypes.bool,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    width: commonStyles.screenWidth,
    hearts: 0,
    likeByMe: false,
    onClick: () => {},
  }

  constructor(props) {
    super(props);

    var image;
    if (this.props.likeByMe === true)
      image = imageRedHeart;
    else
      image = imageHeart;

    this.state = {
      imageLike: image,
      hearts: this.props.hearts,
    }

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  onLike() {
    if (this.props.onLike) {
      this.props.onLike();
    }
  }

  render() {
    const {
      height,
      width,
      name,
      description,
      avatar,
      defaultAvatar,
      time,
      hearts,
      points,
      likeByMe,
      onClick,
      avatarBackColor,
    } = this.props;

    return (
      <TouchableHighlight onPress={ () => onClick() }>
        <View style={ styles.cellContainer }>
          <View style={ styles.avatarContainer }>
            { (avatar != '') && <Image style={ [styles.avatar, { backgroundColor: avatarBackColor }] } source={{ uri:avatar }}/> }
            { (avatar == '') && <Image style={ styles.avatar } source={ defaultAvatar }/> }
          </View>
          <View style={ styles.mainContentContainer }>
            <View style={ styles.topContainer }>
              <View style={ styles.names_timeContainer }>
                <Text style={ styles.textName }>{ name }</Text>
                <Text style={ styles.textSmall }>{ time }</Text>
              </View>
              <Point point={ points }/>
            </View>
            <Text numberOfLines={ 2 } style={ styles.textDescription }>{ description }</Text>
            <View style={ styles.bottomContainer }>
              <TouchableOpacity onPress={ () => this.onLike() }>
                <View style={ styles.heartContainer }>
                  <View style={ styles.likeWrapper }>
                    <Image style={ styles.imageLike } source={ this.props.likeByMe ? imageRedHeart : imageHeart }/>
                  </View>
                  <Text style={ styles.textSmall }>
                    {
                      this.props.hearts == 0 ?
                        "0 - Be the first to like it!"
                        :
                        this.props.hearts > 1 ?
                          this.props.hearts + " Likes"
                          :
                          this.props.hearts + " Like"
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
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
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    borderStyle: 'solid',
  },
  avatarContainer: {
    paddingVertical: 5,
  },
  mainContentContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  names_timeContainer: {
    flex: 1,
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
    flex: 1,
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 14,
    marginTop: 5,
  },
  topContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  bottomContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingRight: 5,
  },
  imageLike: {
    width: 16,
    height: 15,
  },
});

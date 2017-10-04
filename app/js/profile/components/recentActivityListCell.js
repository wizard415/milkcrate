import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';

import { screenWidth } from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';
import Point from '../../components/Point';

const imageHeart = require('../../../assets/imgs/heart.png');
const imageRedHeart = require('../../../assets/imgs/heart_red.png');

export default class RecentActivityListCell extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.number,
    description: PropTypes.string.isRequired,
    points: PropTypes.number,
    onClick: PropTypes.func,
    mode: PropTypes.number,
    likeByMe: PropTypes.bool,
    hearts: PropTypes.number,
  }

  static defaultProps = {
    mode: 0,
    points: 0,
    likeByMe: false,
    hearts: 0,
    onClick: () => {}
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
    /*if (this.props.onLike) {
      this.props.onLike();
    }*/
  }

  render() {
    const {
      height,
      width,
      title,
      icon,
      description,
      points,
      onClick,
      mode,
      time,
    } = this.props;

    return (
      <TouchableHighlight onPress={ () => onClick() }>
        <View style={ styles.cellContainer }>
          <View style={ styles.avatarContainer }>
            {icon&&<Image style={ styles.avatar } source={icon}/>}
          </View>
          <View style={ styles.mainContentContainer }>
            <View style={ styles.topContainer }>
              <View style={ styles.names_timeContainer }>
                <Text style={ styles.textSmall }>{ time }</Text>
              </View>
              <Point point={ points }/>
            </View>
            <Text numberOfLines={ 2 } style={ styles.textDescription }>{ title }</Text>
            <View style={ styles.bottomContainer }>
              <View style={ styles.heartContainer }>
                <Text style={ styles.textSmall }>
                  {this.props.hearts == 0 ?
                    "0 Likes"
                    :
                    this.props.hearts > 1 ?
                      this.props.hearts + " Likes"
                      :
                      this.props.hearts + " Like"
                  }
                </Text>
              </View>
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
    // height: commonStyles.hp(14),
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
    width: 48,
    height: 48,
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
    backgroundColor: 'transparent'
  },
  textDescription: {
    flex: 1,
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 14,
    // marginVertical: 5,
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
    marginTop: 5,
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

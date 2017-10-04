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

import * as commonStyles from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';

const star = require('../../../assets/imgs/star.png');
const heart = require('../../../assets/imgs/heart.png');

export default class BusinessRecentActivityListCell extends Component {

  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    rating: PropTypes.number,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    width: commonStyles.screenWidth,
    height: commonStyles.hp(14),
    heart: 0,
    rating: 0,
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

  onLike() {
    alert("onLike");
  }

  render() {
    const {
      height,
      width,
      name,
      description,
      avatar,
      avatarBackColor,
      defaultAvatar,
      time,
      rating,
      onClick,
    } = this.props;

    return (
      <TouchableHighlight onPress={ () => onClick() }>
        <View style={ styles.cellContainer }>
          <View style={ styles.categoryIconWrapper }>
            { (avatar != '') && <Image style={ [styles.imageCategory, { backgroundColor: avatarBackColor }] } source={{ uri: avatar }}/> }
            { (avatar == '') && <Image style={ styles.imageCategory } source={ defaultAvatar }/> }
          </View>
          <View style={ styles.mainContentContainer }>
            <View style={ styles.contentTopContainer }>
              <View style={ styles.names_timeContainer }>
                <Text numberOfLines={ 2 } style={ styles.textName }>{ name }</Text>
                <Text style={ styles.textSmall }>{ time }</Text>
              </View>
              { (rating > 0) && <View style={ styles.ratingContainer }>
                <Text style={ styles.textSmall }>{ rating} </Text>
                <Image style={ styles.imageStar } source={ star } />
              </View> }
            </View>
            <Text style={ styles.textDescription }>{ description }</Text>
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
    paddingLeft: 5,
    paddingRight: 15,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    borderStyle: 'solid',
  },
  categoryIconWrapper: {
    paddingVertical: 5,
  },
  mainContentContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  contentTopContainer:{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  names_timeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  imageCategory: {
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
    marginVertical: 5,
  },
  like_coinContainer: {
    flex : 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
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
  imageStar: {
    width: 16,
    height: 16,
    marginLeft: 3,
  },
  ratingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

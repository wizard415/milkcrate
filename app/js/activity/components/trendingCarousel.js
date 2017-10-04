import React, { Component, PropTypes } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableHighlight,
} from 'react-native';

import { Actions } from 'react-native-router-flux';

import * as commonStyles from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';
import Point from '../../components/Point';

import UtilService from '../../components/util'

const heart = require('../../../assets/imgs/heart.png');

export const carouselHeight = commonStyles.screenHeight * 0.36;
const entryBorderRadius = 5;

export default class TrendingCarousel extends Component {

  static propTypes = {
    type: PropTypes.string.isRequired,
    title: PropTypes.string,
    icon: PropTypes.number,
    users: PropTypes.array,
    time: PropTypes.number,
    hearts: PropTypes.number,
    points: PropTypes.number,
  };

  getUsers(entries) {
    if (entries.length == 0) {
      return false;
    }

    return entries.map((entry, index) => {

      if (index > 5) {
        return null;
      }

      if (!entry.defaultAvatar && !entry.avatar)
          return null;

      if (entry.avatar) {
        return (
          <Image key={ index } style={ styles.imageUserAvatar } source={{ uri: UtilService.getSmallImage(entry.avatar) }}/>
        );
      } else {
        return (
          <Image key={ index } style={ styles.imageUserAvatar } source={ UtilService.getDefaultAvatar(entry.defaultAvatar) }/>
        );
      }
    });
  }

  goActivityDetail() {
    if (this.props.activityType == 'business') {
      Actions.BusinessesDetail({ business: this.props.rawData });
    } else if(this.props.activityType == 'action') {
      Actions.ActionDetail({ action: this.props.rawData });
    } else if(this.props.activityType == 'event') {
      Actions.EventDetail({ event: this.props.rawData });
    } else if(this.props.activityType == 'service') {
      Actions.ServiceDetail({ event: this.props.rawData });
    } else if(this.props.activityType == 'volunteer_opportunity') {
      Actions.VolunteerDetail({ volunteer: this.props.rawData });
    }
  }

  render () {
    const { 
      type, 
      title, 
      icon, 
      users, 
      time, 
      hearts, 
      points, 
      userCount, 
      activity, 
      activityType,
    } = this.props;

    return (
      <TouchableHighlight
        activeOpacity={ 0.5 }
        underlayColor={ '#fff' }
        style={ styles.slideInnerContainer }
        onPress={ () => this.goActivityDetail() }
      >
        <View style={ styles.contentContainer }>
          <View style={ styles.backgroundContainer }>
            <View style={ styles.topBackground }/>
            <View style={ styles.bottomBackground }>
            </View>
          </View>
          <View style={ styles.topContainer }>
            <Text style={ styles.textCategory }> { type } </Text>
            <View style={ styles.titleContainer }>
              <Image style={ styles.imageTitle } source={ UtilService.getActivityIcon(activityType) } resizeMode="contain"/>
              <Text numberOfLines={ 2 } style={ styles.textTitle }>{ title }</Text>
            </View>
          </View>
          <View style={ styles.centerContainer }>
            <Image style={ styles.imageCategoryIcon } source={ icon }/>
          </View>
          <View style={ styles.bottomContainer }>
            <View style={ styles.avatarsMainContainer }>
              { (users.length > 0) && <View style={ styles.names_timeContainer }>
                <Text style={ styles.textName }>{ users[0].name||users[0].username }</Text>
                { (userCount > 1) && <Text style={ styles.textName }> and { userCount - 1 } others</Text> }
                <Text numberOfLines={ 1 } style={ styles.textSmall }>Latest { UtilService.getPastDateTime(time) }</Text>
              </View> }
              { (users.length > 0) && <View style={ styles.avatarsContainer }>
                { 
                  this.getUsers(users) 
                }
                { 
                  (activity.trendActivityCount > 6) && <View style={ styles.moreUserContainer }>
                    <Text style={ styles.textMoreUser }>+{ activity.trendActivityCount - 6 }</Text>
                  </View>
                }
              </View> }
            </View>
            <View style={ styles.like_coinContainer }>
              <View style={ styles.heartContainer }>
                { false && <Image style={ styles.imageLike } source={ heart }/> }
                { false && <Text style={ styles.textSmall }> { hearts }</Text> }
              </View>
              <Point point={ points }/>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slideInnerContainer: {
    width: commonStyles.carouselItemWidth,
    height: carouselHeight,
    paddingHorizontal: commonStyles.carouselItemHorizontalPadding,
  },
  contentContainer: {
    flex: 1,
    borderRadius: entryBorderRadius,
    backgroundColor: '#fff',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  topBackground: {
    flex: 5,
    width: commonStyles.carouselWidth,
    borderTopLeftRadius: entryBorderRadius,
    borderTopRightRadius: entryBorderRadius,
    backgroundColor: commonColors.theme,
  },
  bottomBackground: {
    flex: 7,
    backgroundColor: '#fff',
    borderBottomLeftRadius: entryBorderRadius,
    borderBottomRightRadius: entryBorderRadius,
    borderWidth: 1,
    borderColor: commonColors.line,
    borderStyle: 'solid',
  },
  imageCategoryIcon: {
    width: carouselHeight * 0.167,
    height: carouselHeight * 0.167,
  },
  topContainer: {
    flex: 4,
    paddingHorizontal: 15,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  bottomContainer: {
    flex: 6,
    borderBottomLeftRadius: entryBorderRadius,
    borderBottomRightRadius: entryBorderRadius,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 10,
  },
  textCategory: {
    color: '#fff',
    fontFamily: 'Blanch',
    fontSize: 32,
    textAlign: 'left',
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTitle: {
    width: 16,
    height: 16,
  },
  textTitle: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontSize: 16,
    textAlign: 'left',
    backgroundColor: 'transparent',
    lineHeight: 16,
    paddingLeft: 5,
  },
  avatarsMainContainer: {
    flex : 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  names_timeContainer: {
    flexDirection: 'row',
  },
  avatarsContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  like_coinContainer: {
    flex : 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  textName: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  textSmall: {
    flex: 1,
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 12,    
    paddingLeft: 5,
    backgroundColor: 'transparent',
  },
  imageUserAvatar: {
    width: 32,
    height: 32,
  },
  moreUserContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    backgroundColor: '#efefef',
  },
  textMoreUser: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 12,
    backgroundColor: 'transparent',
  },
  heartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLike: {
    width: 16,
    height: 15,
  },
});

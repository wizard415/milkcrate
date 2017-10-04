'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ListView,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as activityActions from '../actions';
import { connect } from 'react-redux';
import * as commonActions from '../../common/actions';
import * as commonActionTypes from '../../common/actionTypes';

import { Actions } from 'react-native-router-flux';
import Carousel from 'react-native-snap-carousel';

import NavSearchBar from '../../components/navSearchBar';
import TrendingCarousel from '../components/trendingCarousel';
import RecentActivityListCell from '../../components/recentActivityListCell';
import LoadMoreSpinner from '../../components/loadMoreSpinner';

import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'

const carouselLeftMargin = (commonStyles.carouselerWidth - commonStyles.carouselItemWidth) / 2 - commonStyles.carouselItemHorizontalPadding;

const trending = require('../../../assets/imgs/trending.png');


class Activity extends Component {
  constructor(props) {
    super(props);

    this.dataSourceRecentActivity = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      isRefreshing: false,
      
      categories: [],
      trendings: [],
      community: {},
      recentActivities:[],
      activityQuery: {
        more: true,
        loading: false,
      },

      hasNewAlert: false,
      alerts: [],
      lastAlertTime: 0,
    };

    this.activityQuery = {
      more: true,
      createdAt: 0,
      limit: 20
    };
  }


  componentDidMount(){
    // UtilService.mixpanelEvent("Viewed Activity")
    this.hasMounted = true
    this.loadAllData();
    this.loadAlerts();
  }

  
  componentWillUnmount() {
    this.hasMounted = false
  }


  componentWillReceiveProps(newProps) {
    //console.log("home componentWillReceiveProps", newProps)
    const { commonStatus, likeResult, recentActivityId, recentActivityLike, activityId } = newProps;

    if (commonStatus === commonActionTypes.RECENT_ACTIVITY_LIKE_SUCCESS) {

      let exist = _.find(this.state.recentActivities, (obj) => {
        return obj._id == recentActivityId;
      })

      if (likeResult && exist) {

        if (exist.likedByMe != recentActivityLike) {

          exist.likedByMe = recentActivityLike;

          if (recentActivityLike) {
            exist.likeCount = Number(exist.likeCount || 0) + 1;
          } else {
            exist.likeCount = Math.max(Number(exist.likeCount || 0) - 1, 0);
          }

          this.hasMounted&&this.setState({
            recentActivities: this.state.recentActivities
          });
        }
      }
    } else if(commonStatus === commonActionTypes.ACTIVITY_CAPTURE_SUCCESS) {
      let exist = _.find(this.state.recentActivities, (obj) => {
        return obj._id == activityId;
      })

      if (exist) {
        return;
      }

      //add new recent activity
      bendService.getRecentActivity(activityId, (error, activity) => {
        if (error) {
          console.log(error);
          return;
        }

        this.state.recentActivities.unshift(activity);
        this.hasMounted && this.setState({
          recentActivities: this.state.recentActivities,
        });

        //update challenges
        let exists = _.filter(this.state.challenges, (object)=>{
          return object.activity._id == activity.activity._id;
        });

        this.hasMounted && this.setState({
          challenges: _.difference(this.state.challenges, exists),
        });
      });
    } else if (commonStatus === commonActionTypes.ACTIVITY_REMOVE_SUCCESS) {
      //console.log("commonStatus", commonStatus, activityId)

      //remove recent activity from list
      let exist = _.find(this.state.recentActivities, (obj) => {
        return obj._id == activityId;
      });

      if (exist) {
        let idx = this.state.recentActivities.indexOf(exist);
        this.state.recentActivities.splice(idx, 1);
        this.hasMounted && this.setState({
          recentActivities: this.state.recentActivities,
        });
      }
    } else if (newProps.selectedTab == 'home') {
      //get recent activity again
      this.loadLastActivities();
    }
  }


  loadAllData() {
    if (!this.hasMounted) {
      return;
    }

    this.hasMounted && this.setState({
      categories: [],
      trendings: [],
      community: {},
      recentActivities:[],
      activityQuery: {
        more: true,
        loading: false,
      },
    });

    this.activityQuery = {
      more: true,
      createdAt: 0,
      limit: 20
    };

    bendService.getCategories( (error, result) => {
      if (error) {
        console.log(error);
        return;
      }
      
      if (this.hasMounted) {
        this.setState({ categories: result });
      }      
    });

    bendService.getTrending( (error, result) => {
      if (error) {
        console.log(error);
        return;
      }

      if (this.hasMounted) {
        this.setState({ trendings: result });
      }
    });

    bendService.getCommunity( (error, result) => {
      if (error) {
        console.log(error);
        return;
      }
      if (this.hasMounted) {
        this.setState({ community: result });
      }
    });

    this.loadRecentActivities();
  }


  loadLastActivities() {
    var lastTime = 0;
    if (this.state.recentActivities.length > 0) {
      lastTime = this.state.recentActivities[0]._bmd.createdAt;
    } else {
        return;
    }

    bendService.getLastActivities(lastTime, (error, result)=>{
      if (error) {
        console.log(error);return
      }

      if (result.length > 0) {
        this.state.recentActivities = result.concat(this.state.recentActivities);
        if (this.hasMounted) {
          this.setState({ recentActivities: this.state.recentActivities });
        }
      }
    })
  }


  loadRecentActivities() {

    if ( this.activityQuery.more === false ) {
      return;
    }

    if (this.hasMounted) {
      this.setState( (state) => {
        state.activityQuery.loading = true;
        return state;
      });
    }

    bendService.getRecentActivities(this.activityQuery.createdAt, this.activityQuery.limit + 1, (error, result) => {

      if (this.hasMounted) {
        this.setState( (state) => {
          state.activityQuery.loading = false;
          return state;
        });
        
        this.setState({ isRefreshing: false });
      }

      if (error) {
        console.log(error);
        return;
      }

      this.activityQuery.more = (result.length == this.activityQuery.limit + 1)

      if (this.hasMounted) {
        this.setState((state) => {
          state.activityQuery.more = this.activityQuery.more;
          return state;
        });
      }

      if (this.activityQuery.more) {
        //remove tail item
        result.pop()
      }

      if (result.length > 0) {
        if (this.state.recentActivities.length > 0) {
          UtilService.mixpanelEvent("Loaded More Community Activity")
        } else {
          UtilService.mixpanelEvent("View Recent Community Activity")
        }

        this.state.recentActivities = this.state.recentActivities.concat(result)
        this.activityQuery.createdAt = result[result.length - 1]._bmd.createdAt
        if (this.hasMounted) {
          this.setState({ recentActivities: this.state.recentActivities });
        }
      }

      if (this.hasMounted) {
        this.setState({ activityQuery: this.state.activityQuery });
      }
    });
  }


  renderTrendingCarousel (entries) {
    if (!entries || entries.length == 0) {
      return false;
    }

    return entries.map( (entry, index) => {
      let category = bendService.getActivityCategory(this.state.categories, entry)
      
      if(category == null) {
        return null;
      }

      return (
        <TrendingCarousel
          key={ index }
          type={ UtilService.getTrendTitle(entry.type) }
          activityType={ entry.type }
          activity={ entry }
          title={ entry.name }
          icon={ category ? UtilService.getCategorySticker(category) : require('../../../assets/imgs/category-stickers/transit.png') }
          users={ entry.users }
          userCount={ entry.userCount }
          time={ entry.lastTime }
          hearts={ Number(entry.likeCount || 0) }
          points={ Number(entry.points || 1) }
          rawData={ entry }
        />
      );
    });
  }
  

  get renderTrending() {

    if (this.state.trendings.length > 0) {
      return (
        <View style={ styles.trendingContainer }>
          <View style={ styles.trendingTitleContainer }>
            <Text style={ styles.textTitle }>Currently Trending</Text>
            <Image style={ styles.imageTrending } source={ trending }/>
          </View>
          <Carousel
            sliderWidth={ commonStyles.carouselerWidth }
            itemWidth={ commonStyles.carouselItemWidth }
            inactiveSlideScale={ 1 }
            inactiveSlideOpacity={ 1 }
            enableMomentum={ false }
            containerCustomStyle={ styles.slider }
            contentContainerCustomStyle={ styles.sliderContainer }
            showsHorizontalScrollIndicator={ false }
            snapOnAndroid={ true }
            removeClippedSubviews={ false }
            onSnapToItem={(idx)=>{
              UtilService.mixpanelEvent("Swiped Trending")
            }}
          >
            { this.renderTrendingCarousel(this.state.trendings) }
          </Carousel>
        </View>
      );
    }
  }


  onLike(activity, like) {

    this.props.recentActivityLikeActions.likeRecentActivity(activity, like);
  }


  onRecentActivityCellPressed (activity) {
    if(activity.type == 'business') {
      Actions.BusinessesDetail({ business: activity.activity });
    } else if(activity.type == 'action') {
      Actions.ActionDetail({ action: activity.activity });
    } else if(activity.type == 'event') {
      Actions.EventDetail({ event: activity.activity });
    } else if(activity.type == 'service') {
      Actions.ServiceDetail({ service: activity.activity });
    } else if(activity.type == 'volunteer_opportunity') {
      Actions.VolunteerDetail({ volunteer: activity.activity });
    }
  }


  renderRecentActivityRow(rowData, sectionID, rowID) {

    return (
      <RecentActivityListCell
        name={ rowData.user.name || '' }
        description={ rowData.summary || '' }
        avatar={ rowData.user.avatar ? UtilService.getSmallImage(rowData.user.avatar) : '' }
        avatarBackColor={ UtilService.getBackColor(rowData.user.avatar) }
        defaultAvatar={ UtilService.getDefaultAvatar(rowData.user.defaultAvatar) }
        time={ UtilService.getPastDateTime(rowData._bmd.createdAt) }
        hearts={ Number(rowData.likeCount || 0) }
        likeByMe={ rowData.likedByMe || false }
        points={ Number(rowData.points || 1) }
        onClick={ () => this.onRecentActivityCellPressed(rowData) }
        onLike={ () => this.onLike(rowData, !(rowData.likedByMe || false)) }
      />
    );
  }


  get renderRecentActivity() {
    if (this.state.isRefreshing) {
      return;
    }

    return (
      <View style={ styles.recentActivityContainer }>
        <Text style={ styles.textTitle }>Recent Activity at { this.state.community.name }</Text>
        <View style={ styles.recentActivityListViewWrapper }>
          <ListView
            enableEmptySections={ true }
            scrollEnabled={ false }
            dataSource={ this.dataSourceRecentActivity.cloneWithRows(this.state.recentActivities) }
            renderRow={ this.renderRecentActivityRow.bind(this) }
          />
        </View>
        <LoadMoreSpinner
          show={ this.state.activityQuery.more }
          loading={ this.state.activityQuery.loading }
          onClick={ ()=> this.loadRecentActivities() }
        />
      </View>
    );
  }


  onRefresh() {
    this.hasMounted && this.setState({ isRefreshing: true });
    this.loadAllData();
  }


  onGoSearchScreen() {
    this.props.onSearch();
  } 
  

  renderActivity() {
    return (
      <ScrollView
        style={ styles.listViewWrap }
        refreshControl={
          <RefreshControl
            refreshing={ this.state.isRefreshing }
            onRefresh={ () => this.onRefresh() }
            tintColor={ commonColors.theme }
          />
        }
      >
      { this.renderTrending }
      { this.renderRecentActivity }
      </ScrollView>
    );
  }

  loadAlerts() {
    //first load alerts
    bendService.getUserAlerts( (error, result)=>{
      if (error) {
        console.log(error);
        return;
      }

      if (result.length > 0) {
        this.hasMounted && this.setState({
          alerts: result,
          lastAlertTime:result[0]._bmd.createdAt
        })
      }
    })

    var intervalHandler = setInterval(()=>{
      if(!this.hasMounted) {
        clearInterval(intervalHandler);
        return;
      }
      if (bendService.getActiveUser()) {
        bendService.getLastAlerts(this.state.lastAlertTime, (error, result) => {
          if (error) {
            console.log(error);
            return;
          }

          if (result.length > 0) {
            this.state.alerts = result.concat(this.state.alerts)
            this.hasMounted && this.setState({
              alerts: this.state.alerts,
              lastAlertTime: result[0]._bmd.createdAt,
              hasNewAlert:true
            })
          }
        })
      }
    }, 3000)
  }

  onNotifications() {
    if (this.hasMounted) {
      this.setState({ hasNewAlert: false });
    }

    Actions.Notifications({ alerts: this.state.alerts });
  }

  render() {
    return (
      <View style={ styles.container }>
        <NavSearchBar
            buttons={ commonStyles.NavNotificationButton }
            isNewNotification={ this.state.hasNewAlert }
            onNotifications={ () => this.onNotifications() }
            onGoSearchScreen={ () => this.onGoSearchScreen() }
            searchMode={ false }
        />
        { this.renderActivity() }

      </View>
    );
  }
}


export default connect(state => ({
    status: state.activity.status,
    commonStatus: state.common.status,
    likeResult: state.common.likeResult,
    recentActivityId: state.common.recentActivityId,
    recentActivityLike: state.common.recentActivityLike,
    activityId: state.common.activityId,
  }),
  (dispatch) => ({
    actions: bindActionCreators(activityActions, dispatch),
    recentActivityLikeActions: bindActionCreators(commonActions, dispatch),
  })
)(Activity);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listViewWrap: {
    flex: 1,
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
  },
  trendingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  trendingTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textTitle: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    padding: 10,
  },
  imageTrending: {
    width: 13,
    height: 8,
  },
  slider: {

  },
  sliderContainer: {
    marginLeft: -carouselLeftMargin,
  },
  recentActivityContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  recentActivityListViewWrapper: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
  },
});

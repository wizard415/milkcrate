'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  ListView,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as communityPointsActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import * as commonActions from '../../common/actions';
import * as commonActionTypes from '../../common/actionTypes';

import NavTitleBar from '../../components/navTitleBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';
import RecentActivityListCell from '../../components/recentActivityListCell';
import SimpleLeaderboardListCell from '../components/simpleLeaderboardListCell';
import LoadMoreSpinner from '../../components/loadMoreSpinner';
import EntypoIcon from 'react-native-vector-icons/Entypo';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'
import Cache from '../../components/Cache'

class TeamPoints extends Component {
  constructor(props) {
    super(props);

    this.dataSourceRecentActivity = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.dataSourceLeaderboard = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      isRefreshing: false,

      currentUserIndex: 0,
      userList: [],
      recentActivities: [],
      activityQuery: {
        more: true,
        loading: false,
      },
      currentUser: {},
      sortedUsers:[]
    };

    this.activityQuery = { 
      more: true,
      createdAt: 0, 
      limit: 20 
    };
  }

  componentDidMount() {
    this.hasMounted = true
    this.loadAllData();
    UtilService.mixpanelEvent("Viewed Team Points")
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  componentWillReceiveProps(newProps) {
    console.log("newProps", newProps)
    const { commonStatus, likeResult, recentActivityId, recentActivityLike } = newProps;

    if (commonStatus === commonActionTypes.RECENT_ACTIVITY_LIKE_SUCCESS) {

      var exist = _.find(this.state.recentActivities, (obj) => {
        return obj._id == recentActivityId;
      })

      if (likeResult && exist) {

        if (exist.likedByMe != recentActivityLike) {

          exist.likedByMe = recentActivityLike;

          if (recentActivityLike)
            exist.likeCount = Number(exist.likeCount || 0) + 1;
          else
            exist.likeCount = Math.max(Number(exist.likeCount || 0) - 1, 0);

          this.hasMounted && this.setState({
            recentActivities:this.state.recentActivities
          });
        }
      }
    }
  }

  loadAllData() {
    bendService.getUser( (error, result) => {
      this.hasMounted && this.setState({
        currentUser: result,
      })
    })

    this.hasMounted && this.setState({
      currentUserIndex: 0,
      userList: [],
      recentActivities: [],
      activityQuery: {
        more: true,
        loading: false,
      }
    });

    this.activityQuery = { 
      more: true,
      createdAt: 0, 
      limit: 20 
    };

    this.totalUsers = 0;
    
    bendService.getTeamUsers(this.props.team._id, (err, rets)=>{
      this.teamUsers = rets;
      console.log("team users", rets)

      bendService.getTeamLeaderBoardSimpleList(this.teamUsers, (error, userList, allSortedUsers) => {
        console.log("getTeamLeaderBoardSimpleList : ", userList, allSortedUsers)
        if (error) {
          console.log(error);
          return;
        }

        var currentUserIndex = _.find(userList, (obj)=>{
          return obj._id == bendService.getActiveUser()._id;
        })

        this.totalUsers = allSortedUsers.length
        this.state.sortedUsers = allSortedUsers

        this.hasMounted && this.setState({
          currentUserIndex: currentUserIndex,
          userList: userList,
          sortedUsers:this.state.sortedUsers
        })
      })

      this.loadRecentActivities(this.teamUsers);
    })
  }

  onPressedRecentActivityCell(rowID) {
    // alert("Tapped cell - " + rowID);
  }

  onLeaderboardCellPressed () {
    if(this.state.currentUserIndex)
      Actions.TeamLeaderBoard({ team:this.props.team, users: this.state.sortedUsers, currentUser:this.state.currentUser });
  }

  loadRecentActivities() {
    if ( this.state.activityQuery.more === false )
      return;

    this.hasMounted && this.setState( (state) => {
      state.activityQuery.loading = true;
      return state;
    });

    bendService.getTeamRecentActivities(this.teamUsers, this.activityQuery.createdAt, this.activityQuery.limit + 1, (error, result) => {
      console.log("getTeamRecentActivities", error, result.length)
      this.hasMounted && this.setState( (state) => {
        state.activityQuery.loading = false;
        return state;
      });

      this.hasMounted && this.setState({ isRefreshing: false });

      if (error) {
        console.log(error);
        return;
      }

      this.state.activityQuery.more = (result.length == this.activityQuery.limit + 1)

      this.hasMounted && this.setState( (state) => {
        state.activityQuery.more = this.state.activityQuery.more;
        return state;
      });

      if (this.state.activityQuery.more) {
        //remove tail item
        result.pop()
      }

      if (result.length > 0) {
        this.state.recentActivities = this.state.recentActivities.concat(result)
        this.activityQuery.createdAt = result[result.length - 1]._bmd.createdAt
        this.hasMounted && this.setState({
          recentActivities:this.state.recentActivities
        })
      }

      this.hasMounted && this.setState({
        activityQuery: this.state.activityQuery
      })
    })
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

  onLike(activity, like) {
    
    this.props.recentActivityLikeActions.likeRecentActivity(activity, like);
  }

  renderLeaderboardRow(rowData, sectionID, rowID) {
    let name = rowData.name;
    if (name === undefined) {
      name = rowData.username;
    }

    return (
      <SimpleLeaderboardListCell
        status={ 0 }
        index={ this.getPosition(rowData._id) }
        name={ name }
        points={ rowData.sprintPoints }
        avatar={ rowData.avatar ? UtilService.getSmallImage(rowData.avatar) : '' }
        avatarBackColor={ UtilService.getBackColor(rowData.avatar) }
        defaultAvatar={ UtilService.getDefaultAvatar(rowData.defaultAvatar) }
        currentUserIndex={ this.getPosition(this.state.currentUser._id) }
      />
    );
  }

  onBack() {
    Actions.pop();
  }

  onRefresh() {
    this.hasMounted && this.setState({ isRefreshing: true });
    this.loadAllData();    
  }

  getPosition(id) {
    var idx = this.state.sortedUsers.indexOf(id);
    return (idx + 1)
  }

  render() {
    const currentUser = this.state.currentUser
    const {team} = this.props

    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ commonStyles.NavBackButton }
          onBack={ this.onBack }
          title ='Your Team'
        />
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={ this.state.isRefreshing }
              onRefresh={ () => this.onRefresh() }
              tintColor={ commonColors.theme }
            />
          }
        >
          <View style={ styles.topContainer }>
            <View style={ styles.logoContainer }>
              <View style={[styles.imageText, {backgroundColor:team.color}]}>
                <Text style={styles.textInitial}>{team.initials}</Text>
              </View>
              { <Text style={ styles.textName }>{ team.name }</Text> }
            </View>
            <View style={ styles.pointContainer }>
              <View style={ styles.pointSubContainer }>
                <Text style={ styles.textValue }>{ team.totalPoints || 0 }</Text>
                <Text style={ styles.textSmall }>Total Points</Text>
              </View>
              <View style={ styles.pointSubContainer }>
                <Text style={ styles.textValue }>{ team.volunteerHours || 0 }</Text>
                <Text style={ styles.textSmall }>Hours Volunteered</Text>
              </View>
            </View>
          </View>

          { (this.state.userList.length > 0) && <View style={ styles.leaderboardContainer }>
            {this.state.currentUserIndex && <Text style={ styles.textSectionTitle }>{ team.name } Leaderboard • You are in { UtilService.getPositionString(this.getPosition(currentUser._id)) } place</Text>}
            {!this.state.currentUserIndex && <Text style={ styles.textSectionTitle }>{ team.name } Leaderboard</Text>}
            <TouchableOpacity
              onPress={ () => this.onLeaderboardCellPressed() }
              activeOpacity={ this.state.currentUserIndex?0.5:1 }
            >
              <View style={ styles.leaderboardListViewWrapper }>
                <ListView
                  enableEmptySections={ true }
                  dataSource={ this.dataSourceLeaderboard.cloneWithRows(this.state.userList) }
                  renderRow={ this.renderLeaderboardRow.bind(this) }
                  contentContainerStyle={ styles.leaderboardListView }
                />
                {this.state.currentUserIndex && <View style={ styles.viewMoreContainer }>
                  <Text style={ styles.textViewMore }>View More</Text>
                  <EntypoIcon style={ styles.rightIcon } name="chevron-thin-right" size={ 15 } color={ commonColors.grayMoreText }/>
                </View>}
              </View>
            </TouchableOpacity>
          </View> }

          <Text style={ styles.textSectionTitle }>Recent Activity</Text>
          <View style={ styles.recentActivityListViewWrapper }>
            <ListView
              enableEmptySections={ true }
              dataSource={ this.dataSourceRecentActivity.cloneWithRows(this.state.recentActivities) }
              renderRow={ this.renderRecentActivityRow.bind(this) }
            />
          </View>
          <LoadMoreSpinner
            show={ this.state.activityQuery.more }
            loading={ this.state.activityQuery.loading }
            onClick={ ()=> this.loadRecentActivities() }
          />
        </ScrollView>
      </View>
    );
  }
}

export default connect(state => ({
    status: state.profile.status,
    commonStatus: state.common.status,
    likeResult: state.common.likeResult,
    recentActivityId: state.common.recentActivityId,
    recentActivityLike: state.common.recentActivityLike,
  }),
  (dispatch) => ({
    actions: bindActionCreators(communityPointsActions, dispatch),
    recentActivityLikeActions: bindActionCreators(commonActions, dispatch),
  })
) (TeamPoints);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  textName: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 24,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageComcast: {
    width: 300,
    height: 100,
    marginBottom: 8
  },
  pointContainer: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  pointSubContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    margin:10,
    marginTop:20,
    marginBottom:20,
    width: 40,
    height: 40,
    borderRadius:5,
  },
  textInitial: {
    color: '#ffffff',
    fontFamily: 'Open Sans',
    fontSize: 24,
    paddingTop:5,
    backgroundColor: 'transparent',
    textAlign:'center'
  },
  textTeamName: {
    flex:1,
    paddingTop:10,
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 24,
    backgroundColor: 'transparent',
    textAlign:'left'
  },
  textValue: {
    color: commonColors.bottomButton,
    fontFamily: 'Open Sans',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textSmall: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 12,
    backgroundColor: 'transparent',
  },
  textSectionTitle: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    padding: 10,
  },
  recentActivityListViewWrapper: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
  },
  leaderboardContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  leaderboardListViewWrapper: {
    flexDirection: 'row',
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    height: 130,
  },
  leaderboardListView: {
    flex: 1,
    justifyContent: 'center',
  },
  viewMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textViewMore: {
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  rightIcon: {
    paddingTop: 2.5,
    alignSelf: 'center',
  },
});

'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ListView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as leaderboardActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';

import NavTitleBar from '../../components/navTitleBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';

import LeaderboardListCell from '../components/leaderboardListCell';
import { LeaderboardEntries } from '../../components/dummyEntries';
import LoadMoreSpinner from '../../components/loadMoreSpinner';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'
import Cache from '../../components/Cache'

const comcast =   require('../../../assets/imgs/comcast.png');

class Leaderboard extends Component {
  
  constructor(props) {
    super(props);

    this.dataSourceLeaderboard = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      currentUserIndex: 3,
      userList: [],
      query:{
        offset: 0,
        limit: 25,
        more: true,
        loading: false,
      },
      community: {}
    };

    this.loadUserPage.bind(this);
  }

  componentDidMount() {
    this.hasMounted = true
    bendService.getCommunity((error, result)=>{
      if (!error)
        this.hasMounted && this.setState({
          community: result,
        })
    })

    this.loadUserPage();
    UtilService.mixpanelEvent("Viewed Leaderboard")
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  loadUserPage() {
    if ( this.state.query.more === false )
      return;

    this.hasMounted && this.setState( (state) => {
      state.query.loading = true;
      return state;
    });

    bendService.getLeaderBoardPage(this.state.query.offset, this.state.query.limit + 1, (error, result) => {
      //console.log("getRecentActivities", error, result)
      this.hasMounted && this.setState( (state) => {
        state.query.loading = false;
        return state;
      });

      if (error) {
        console.log(error);
        return;
      }

      this.state.query.more = (result.length == this.state.query.limit + 1)
      if (this.state.query.more) {
        //remove tail item
        result.pop()
      }

      if (result.length > 0) {
        this.state.userList = this.state.userList.concat(result)
        this.state.query.offset += result.length
        this.hasMounted && this.setState({
          userList: this.state.userList
        })
      }

      this.hasMounted && this.setState({
        query: this.state.query
      })
    })
  }

  renderLeaderboardRow(rowData, sectionID, rowID) {
    var previousRank = rowData.previousSprintRank, currentRank = rowData.sprintRank
    
    return (
      <LeaderboardListCell
        status={ previousRank == -1?0 : (previousRank < currentRank ? 2 : (previousRank > currentRank ? 1 : 0)) }
        index={ rowData.sprintRank }
        name={ rowData.name||rowData.username }
        points={ rowData.sprintPoints }
        avatar={ rowData.avatar ? UtilService.getSmallImage(rowData.avatar) : '' }
        avatarBackColor={ UtilService.getBackColor(rowData.avatar) }
        defaultAvatar={ UtilService.getDefaultAvatar(rowData.defaultAvatar) }
        currentUser={ bendService.getActiveUser().sprintRank==rowData.sprintRank }
      />
    );
  }
  
  onBack () {
    Actions.pop()
  }

  onCheckin() {
    alert("Tapped 'I Did This' button!");
  }

  render() {
    const { 
      total,
    } = this.props;

    const currentUser = bendService.getActiveUser();
    const community = this.state.community;
    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ commonStyles.NavBackButton }
          onBack={ this.onBack }
          title ='LEADERBOARD'
        />
        <View style={ styles.orderContainer }>
          { community.logo && <Image source={{ uri : community.logo._downloadURL }} style={ styles.imageComcast } resizeMode="contain"/> }
          <Text style={ styles.textOrder }>{ UtilService.getPositionString(currentUser.sprintRank) } out of { total } people</Text>
          <Text style={ styles.textUpdate }>Updated every 15 mins</Text>
        </View>

        <ScrollView>
          <ListView
            enableEmptySections={ true }
            dataSource={ this.dataSourceLeaderboard.cloneWithRows(this.state.userList) }
            renderRow={ this.renderLeaderboardRow.bind(this) }
            contentContainerStyle={ styles.leaderboardListView }
          />
          <LoadMoreSpinner
            show={ this.state.query.more }
            loading={ this.state.query.loading }
            onClick={ ()=> this.loadUserPage() }
          />
        </ScrollView>
      </View>
    );
  }
}

export default connect(state => ({
  status: state.search.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(leaderboardActions, dispatch)
  })
)(Leaderboard);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 35,
  },
  imageComcast: {
    width: 300,
    height: 100,
    marginBottom: 8
  },
  textOrder: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontSize: 12,
  },
  textUpdate: {
    marginTop: 10,
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    // fontWeight: 'bold',
    fontSize: 10,
  },
  leaderboardListViewWrapper: {
    flex: 1,
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
  },
  leaderboardListView: {
    flex: 1,
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,    
  },
});
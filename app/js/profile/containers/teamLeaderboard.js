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

class TeamLeaderBoard extends Component {
  
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
    };

    this.loadUserPage.bind(this);
  }

  componentDidMount() {
    this.hasMounted = true

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

    bendService.getTeamLeaderBoardPage(this.props.users, this.state.query.offset, this.state.query.limit + 1, (error, result) => {
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

  getPosition(id) {
    var idx = this.props.users.indexOf(id);
    return (idx + 1)
  }

  renderLeaderboardRow(rowData, sectionID, rowID) {
    return (
      <LeaderboardListCell
        status={ 0}
        index={ this.getPosition(rowData._id) }
        name={ rowData.name||rowData.username }
        points={ rowData.sprintPoints }
        avatar={ rowData.avatar ? UtilService.getSmallImage(rowData.avatar) : '' }
        avatarBackColor={ UtilService.getBackColor(rowData.avatar) }
        defaultAvatar={ UtilService.getDefaultAvatar(rowData.defaultAvatar) }
        currentUser={ bendService.getActiveUser()._id==rowData._id }
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
      users,
      team,
        currentUser
    } = this.props;

    const community = this.state.community;
    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ commonStyles.NavBackButton }
          onBack={ this.onBack }
          title ='TEAM LEADERBOARD'
        />
        <ScrollView>
          <View style={ styles.orderContainer }>
            <View style={ styles.logoContainer2 }>
              <View style={[styles.imageText2, {backgroundColor:team.color}]}>
                <Text style={styles.textInitial2}>{team.initials}</Text>
              </View>
              { <Text style={ styles.textTeamName2 }>{ team.name }</Text> }
            </View>
            <Text style={ styles.textOrder }>{ UtilService.getPositionString(this.getPosition(currentUser._id)) } out of { users.length } people</Text>
            <Text style={ styles.textUpdate }>Updated every 15 mins</Text>
          </View>
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
)(TeamLeaderBoard);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 24,
  },
  logoContainer2: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageText2: {
    margin:10,
    marginTop:10,
    marginBottom:20,
    width: 40,
    height: 40,
    borderRadius:5,
  },
  textInitial2: {
    color: '#ffffff',
    fontFamily: 'Open Sans',
    fontSize: 24,
    paddingTop:5,
    backgroundColor: 'transparent',
    textAlign:'center'
  },
  textTeamName2: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 24,
    paddingBottom:5,
    backgroundColor: 'transparent',
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
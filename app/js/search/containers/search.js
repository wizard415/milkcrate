'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Alert,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as searchActions from '../actions';
import { connect } from 'react-redux';

import { Actions } from 'react-native-router-flux';
import NavSearchBar from '../../components/navSearchBar';
import { screenWidth, activityCellSize, categoryCellSize } from '../../styles/commonStyles';
import MainSearch from './mainSearch';
import FilterSearch from './filterSearch';
import * as commonStyles from '../../styles/commonStyles';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'

class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainSearchPage: true,
      searchText: '',
      searchAutoFocus: false,

      hasNewAlert: false,
      alerts: [],
      lastAlertTime: 0,
    };
  }

  componentWillReceiveProps(newProps) {
    if(newProps.selectedTab == 'search') {
      if(this.state.searchText == "") {
        this.hasMounted && this.setState({
          mainSearchPage: true
        });
      }
    } else {
      if (newProps.searchAutoFocus == true){
        this.hasMounted && this.setState({ searchAutoFocus: true });
      }
    }
  }

  componentDidMount() {
    this.hasMounted = true
    if (this.props.searchAutoFocus == true){
      this.hasMounted && this.setState({ searchAutoFocus: true });
    }

    UtilService.mixpanelEvent("Viewed Search Screen")
    this.loadAlerts();
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  onSearchChange(text) {
    this.hasMounted && this.setState({ searchText: text });
  }

  onSearchFocus() {
    this.hasMounted && this.setState({
      mainSearchPage: false,
      searchAutoFocus: false
    });
  }

  onSearchCancel() {
    this.hasMounted && this.setState({
      searchAutoFocus: false,
      mainSearchPage: true 
    });
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
          onSearchChange={ (text) => this.onSearchChange(text) }
          onCancel={ () => this.onSearchCancel() }
          onFocus={ () => this.onSearchFocus() }
          searchAutoFocus={ this.state.searchAutoFocus }
        />
        {
          this.state.mainSearchPage ?
          <MainSearch
            subOne={ this.props.subOne }
            countByCategory={this.props.countByCategory}
          />
          :
          <FilterSearch 
            searchText={ this.state.searchText }
          />
        }
      </View>
    );
  }
}

export default connect(state => ({
  status: state.search.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(searchActions, dispatch)
  })
)(Search);

const styles = StyleSheet.create({
  container: {
    flex : 1,
  },
});

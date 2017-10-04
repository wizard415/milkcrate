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
import * as alertActions from '../actions';
import { connect } from 'react-redux';

import { Actions } from 'react-native-router-flux';
import AlertListCell from '../components/alertListCell';
import NavTitleBar from '../../components/navTitleBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'

class Notifications extends Component {
  constructor(props) {
    super(props);

    this.dataSourceAlert = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      isRefreshing: false,
    };
  }

  componentDidMount(){
    UtilService.mixpanelEvent("Viewed Alerts")
    // this.loadAllData();
    this.hasMounted = true
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  loadAllData() {

    this.hasMounted && this.setState({
      alerts: []
    });

    bendService.getUserAlerts( (error, result)=>{

      this.hasMounted && this.setState({ isRefreshing: false });

      if(error) {
        console.log(error);
        return;
      }

      //console.log("alerts", result)

      this.hasMounted && this.setState({
        alerts: result
      })
    })
  }

  renderAlertRow(rowData, sectionID, rowID) {

    if (rowData.actor.name === undefined) { 
      return null;
    }

    let iconUrl = '';
    if (rowData.actor.avatar) {      
      iconUrl = UtilService.getSmallImage(rowData.actor.avatar);

      if (iconUrl === undefined) {
        iconUrl = '';
      }
    }

    return (
      <AlertListCell
        name={ rowData.actor.name }
        description={ rowData.message }
        avatar={ iconUrl }
        avatarBackColor={ UtilService.getBackColor(rowData.actor.avatar) }
        time={ UtilService.getPastDateTime(rowData._bmd.createdAt) }
        onClick={ () => this.onAlertCellPressed(rowData.activity) }
      />
    );
  }

  onAlertCellPressed (activity) {
    UtilService.mixpanelEvent("Tapped on an Alert")
    // alert("Tapped cell - " + rowID);
  }

  onGoSearchScreen() {
    this.props.onSearch();
  }

  onRefresh() {
    //this.setState({ isRefreshing: true });
    this.loadAllData();    
  }

  onBack() {
    Actions.pop();
  }

  renderAlert() {
    if(this.props.alerts.length > 0) {
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
          <ListView
            enableEmptySections={ true }
            dataSource={ this.dataSourceAlert.cloneWithRows(this.props.alerts) }
            renderRow={ this.renderAlertRow.bind(this) }
          />
        </ScrollView>
      )
    } else {
      return (
        <View style={styles.emptyPage}>
          <Text style={styles.noResultText}>Alerts will appear here when someone likes your activity, new challenges are pushed to your phone and more!</Text>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ commonStyles.NavBackButton }
          onBack={ this.onBack }
          title ='My Alerts'
        />
        {
            this.renderAlert()
        }

      </View>
    );
  }
}

export default connect(state => ({
  status: state.search.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(alertActions, dispatch)
  })
)(Notifications);

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
  emptyPage : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  noResultText : {
    padding:30,
    fontSize:16,
    fontFamily: 'OpenSans-Semibold',
    color: commonColors.grayMoreText,
    textAlign:'center',
    lineHeight:30
  }
});

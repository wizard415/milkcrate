import React, { Component } from 'react';
import {
  StyleSheet,
  ListView,
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as searchActions from '../actions';
import { connect } from 'react-redux';
import * as commonActions from '../../common/actions';
import * as commonActionTypes from '../../common/actionTypes';

import { Actions } from 'react-native-router-flux';

import NavTitleBar from '../../components/navTitleBar';
import BusinessesListCell from '../components/businessesListCell';
import EventsListCell from '../components/eventsListCell';
import * as commonColors from '../../styles/commonColors';
import  * as commonStyles from '../../styles/commonStyles';

import UtilService from '../../components/util'
import Cache from '../../components/Cache'
import bendService from '../../bend/bendService'

class PinListView extends Component {
  constructor(props) {
    super(props);

    this.dataSource = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      isRefreshing: true,
      currentLocation: null,
      activities: {
        event: [],
        service: [],
        action: [],
        volunteer_opportunity: [],
        business: [],
      },
    };
  }

  componentDidMount() {
    this.hasMounted = true
    this.loadAllData();
    UtilService.mixpanelEvent("Viewed Pinned Activities")
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  componentWillReceiveProps(newProps) {
    
    if (newProps.commonStatus === commonActionTypes.ALL_PINNED_ACTIVITIES) {
      this.hasMounted && this.setState({
        activities: newProps.allPinnedActivities,
        isRefreshing: false,
      });
    }    
  }


  loadAllData() {
    this.hasMounted && this.setState({
      isRefreshing: true,
      activities: {
        event: [],
        service: [],
        action: [],
        volunteer_opportunity: [],
        business: [],
      },
    });

    navigator.geolocation.getCurrentPosition(
        (position) => {
          if (position) {
            this.hasMounted && this.setState({ currentLocation: position })
          }
        },
        (error) => {
          console.log(JSON.stringify(error));
          // alert(JSON.stringify(error));
        },
        Platform.OS === 'ios'?{ enableHighAccuracy: commonStyles.geoLocation.enableHighAccuracy, timeout: commonStyles.geoLocation.timeout, maximumAge: commonStyles.geoLocation.maximumAge }:null
    );

    this.props.commonActions.updateAllPinnedActivities();
    
  }

  onBack() {
    Actions.pop()
  }

  onRecentActivityCellPressed (activity) {
    if (activity.type == 'business') {
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


  renderActionsListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.activity.name }
        icon={ UtilService.getCategoryIconFromSlug(rowData.activity) }
        points={ Math.max(rowData.activity.points || 1, 1) }
        onClick={ () => this.onRecentActivityCellPressed(rowData) }
      />
    );
  }

  renderBusinessesListRow(rowData, sectionID, rowID) {
    return (
      <BusinessesListCell
        title={ rowData.activity.name }
        icon={ UtilService.getCategoryIconFromSlug(rowData.activity)}
        description={ rowData.activity.description }
        distance={ rowData.activity._geoloc&&this.state.currentLocation ? UtilService.getDistanceFromLatLonInMile(rowData.activity._geoloc[1], rowData.activity._geoloc[0],
        this.state.currentLocation.coords.latitude, this.state.currentLocation.coords.longitude) : null }
        price={ Number(rowData.activity.priceTier) }
        rating={ Number(rowData.activity.rating || 0) }
        onClick={ () => this.onRecentActivityCellPressed(rowData) }
      />
    );
  }

  renderEventsListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.activity.name }
        icon={ UtilService.getCategoryIconFromSlug(rowData.activity) }
        points={ Math.max(rowData.activity.points || 1, 1) }
        onClick={ () => this.onRecentActivityCellPressed(rowData) }
      />
    );
  }

  renderVolunteerListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.activity.name }
        icon={ UtilService.getCategoryIconFromSlug(rowData.activity) }
        points={ Math.max(rowData.activity.points || 1, 1) }
        onClick={ () => this.onRecentActivityCellPressed(rowData) }
      />
    );
  }

  renderServicesListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.activity.name }
        icon={ UtilService.getCategoryIconFromSlug(rowData.activity) }
        points={ Math.max(Number(rowData.activity.points || 1), 1) }
        onClick={ () => this.onRecentActivityCellPressed(rowData) }
      />
    );
  }

  get showActions() {
    return(
      this.state.activities.action.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>Actions</Text>
          </View>
          <ListView
            enableEmptySections={ true }
            dataSource={ this.dataSource.cloneWithRows(this.state.activities.action) }
            renderRow={ this.renderActionsListRow.bind(this) }
            contentContainerStyle={ styles.listViewWrapper }
          />
        </View>
      :
        null
    );
  }

  get showBusinesses() {
    return (
      this.state.activities.business.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>Businesses</Text>
          </View>
          <ListView
            enableEmptySections={ true }
            dataSource={ this.dataSource.cloneWithRows(this.state.activities.business) }
            renderRow={ this.renderBusinessesListRow.bind(this) }
            contentContainerStyle={ styles.listViewWrapper }
          />
        </View>
      :
        null
    );
  }

  get showEvents() {
    return (
      this.state.activities.event.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>Events</Text>
          </View>
          <ListView
            enableEmptySections={ true }
            dataSource={ this.dataSource.cloneWithRows(this.state.activities.event) }
            renderRow={ this.renderEventsListRow.bind(this) }
            contentContainerStyle={ styles.listViewWrapper }
          />
        </View>
      :
        null
    );
  }

  get showVolunteer() {
    return (
      this.state.activities.volunteer_opportunity.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>Volunteer Opportunities</Text>
          </View>
          <ListView
            enableEmptySections={ true }
            dataSource={ this.dataSource.cloneWithRows(this.state.activities.volunteer_opportunity) }
            renderRow={ this.renderVolunteerListRow.bind(this) }
            contentContainerStyle={ styles.listViewWrapper }
          />
        </View>
      :
        null
    );
  }

  get showServices() {
    return (
      this.state.activities.service.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>Services</Text>
          </View>
          <ListView
            enableEmptySections={ true }
            dataSource={ this.dataSource.cloneWithRows(this.state.activities.service) }
            renderRow={ this.renderServicesListRow.bind(this) }
            contentContainerStyle={ styles.listViewWrapper }
          />
        </View>
      :
        null
    );
  }

  onRefresh() {
    this.hasMounted && this.setState({ isRefreshing: true });
    this.loadAllData();    
  }

  render() {
    return (
      <View style={ styles.container }>
        <NavTitleBar
          buttons={ commonStyles.NavBackButton }
          onBack={ this.onBack }
          title={ 'MY PINNED ACTIVITIES' }
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
          { this.showActions }
          { this.showBusinesses }
          { this.showEvents }
          { this.showVolunteer }
          { this.showServices }
        </ScrollView>
      </View>
    );
  }
}

export default connect(props => ({
    status: props.search.status,
    commonStatus: props.common.status,
    allPinnedActivities: props.common.allPinnedActivities,
  }),
  (dispatch) => ({
    actions: bindActionCreators(searchActions, dispatch),
    commonActions: bindActionCreators(commonActions, dispatch),
  })
)(PinListView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listViewWrapper: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
  },
  textSectionTitle: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    marginTop: 16,
    marginLeft: 8,
    marginBottom: 8,
  },
  activityIndicator: {
    marginTop: 10,
    flex: 1,
  },
});

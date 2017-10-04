'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  ListView,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  Alert,
  Platform
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { bindActionCreators } from 'redux';
import * as searchActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';

import Cache from '../../components/Cache'
import UtilService from '../../components/util'
import bendService from '../../bend/bendService'

import BusinessesListCell from '../components/businessesListCell';
import EventsListCell from '../components/eventsListCell';

import * as commonColors from '../../styles/commonColors';
import  * as commonStyles from '../../styles/commonStyles';

class FilterSearch extends Component {
  constructor(props) {
    super(props);

    this.dataSource = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      currentLocation: null,
      activities: {
        event: [],
        service: [],
        action: [],
        volunteer_opportunity: [],
        business: [],
      },
      icons: {
        event: [],
        service: [],
        action: [],
        volunteer_opportunity: [],
        business: [],
      },
      totalCount: 1,
      community:{}
    };
    this.searchText = ""
  }

  componentDidMount() {
    this.hasMounted = true
    navigator.geolocation.getCurrentPosition( 
      (position) => {
        this.hasMounted && this.setState({ currentLocation: position })
      },
      (error) => {
        console.log(JSON.stringify(error));
      },
        Platform.OS === 'ios'?{ enableHighAccuracy: commonStyles.geoLocation.enableHighAccuracy, timeout: commonStyles.geoLocation.timeout, maximumAge: commonStyles.geoLocation.maximumAge }:null
    );

    bendService.getCommunity((err, ret)=>{
      if(err) {
        console.log(err);
        return
      }

      this.setState({
        community:ret
      })
    })
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  componentWillReceiveProps(newProps) {
    this.searchText = newProps.searchText
    setTimeout((searchText)=>{
      if (searchText == this.searchText) {
        this.getActivities(searchText);
        this.searchText = "";
        this.hasMounted && this.setState({ totalCount: 1 });
      }
    }, 300, newProps.searchText)
  }

  getActivityIcons(activities) {
    this.hasMounted && this.setState( (state) => {
      state.icons.event = [];
      state.icons.service = [];
      state.icons.action = [];
      state.icons.volunteer_opportunity = [];
      state.icons.business = [];
      return state;
    });

    //event icons
    activities.event.map( (event, index) => {
      if (event.categories && event.categories.length > 0) {
        bendService.getCategory(event.categories[0], (error, result) => {

          if (error){
            console.log(error);
            return;
          }

          this.hasMounted && this.setState( (state) => {
            state.icons.event[index] = UtilService.getCategoryIcon(result.slug);
            return state;
          });
        })
      }
    });

    //service icons
    activities.service.map( (service, index) => {
      if (service.categories && service.categories.length > 0) {
        bendService.getCategory(service.categories[0], (error, result) => {

          if (error){
            console.log(error);
            return;
          }
          this.hasMounted && this.setState( (state) => {
            state.icons.service[index] = UtilService.getCategoryIcon(result.slug);
            return state;
          });
        })
      }
    });

    //action icons
    activities.action.map( (action, index) => {
      if (action.categories && action.categories.length > 0) {
        bendService.getCategory(action.categories[0], (error, result)=>{

          if (error){
            console.log(error);
            return;
          }
          this.hasMounted && this.setState( (state) => {
            state.icons.action[index] = UtilService.getCategoryIcon(result.slug);
            return state;
          });
        })
      }
    });

    //volunteer_opportunity icons
    activities.volunteer_opportunity.map( (volunteer_opportunity, index) => {
      if (volunteer_opportunity.categories && volunteer_opportunity.categories.length > 0) {
        bendService.getCategory(volunteer_opportunity.categories[0], (error, result) => {

          if (error){
            console.log(error);
            return;
          }

          this.hasMounted && this.setState( (state) => {
            state.icons.volunteer_opportunity[index] = UtilService.getCategoryIcon(result.slug);
            return state;
          });
        })
      }
    });

    //business icons
    activities.business.map( (business, index) => {
      if (business.categories && business.categories.length > 0) {
        bendService.getCategory(business.categories[0], (error, result) => {

          if (error){
            console.log(error);
            return;
          }
          this.hasMounted && this.setState( (state) => {
            state.icons.business[index] = UtilService.getCategoryIcon(result.slug);
            return state;
          });
        })
      }
    });
  }

  getActivities(searchText) {
    console.log("getActivities", searchText)
    var param = {
      query: searchText
    }

    if (this.state.currentLocation) {
      param.lat = this.state.currentLocation.coords.latitude;
      param.long = this.state.currentLocation.coords.longitude;
    } else {
      if (this.state.community && this.state.community._geoloc) {
        param.lat = this.state.community._geoloc[1];
        param.long = this.state.community._geoloc[0];
      }
    }

    bendService.searchActivity(param, (error, result) => {
      if (error) {
        console.log("search failed", error);
        return;
      }

      var activities = result.data;
      this.hasMounted && this.setState({
        activities: activities,
        totalCount: result.count
      });
      this.getActivityIcons(activities);
    })
  }
  onPressedActionsCell (action) {
    Actions.ActionDetail({
      action: action
    })
  }

  onPressedBusinessesCell (business) {
    Actions.BusinessesDetail({
      business: business
    })
  }

  onPressedEventCell (event) {
    Actions.EventDetail({
      event: event
    })
  }

  onPressedServiceCell (service) {
    Actions.ServiceDetail({
      service: service
    })
  }

  onPressedVolunteerCell (volunteer) {
    Actions.VolunteerDetail({
      volunteer: volunteer
    })
  }

  renderActionsListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.name }
        icon={ this.state.icons.action[rowID] }
        points={ Math.max(rowData.points || 1, 1) }
        onClick={ () => this.onPressedActionsCell(rowData) }
        userActivity={rowData.userActivity}
      />
    );
  }

  renderBusinessesListRow(rowData, sectionID, rowID) {
    return (
      <BusinessesListCell
        title={ rowData.name }
        icon={ this.state.icons.business[rowID] }
        description={ rowData.description }
        distance={ rowData._geoloc && this.state.currentLocation ? UtilService.getDistanceFromLatLonInMile(rowData._geoloc[1], rowData._geoloc[0],
        this.state.currentLocation.coords.latitude, this.state.currentLocation.coords.longitude) : null }
        price={ Number(rowData.priceTier) }
        rating={ Number(rowData.rating || 0)}
        onClick={ () => this.onPressedBusinessesCell(rowData) }
        userActivity={rowData.userActivity}
      />
    );
  }

  renderEventsListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.name }
        icon={ this.state.icons.event[rowID] }
        points={ Math.max(rowData.points || 1, 1) }
        onClick={ () => this.onPressedEventCell(rowData) }
        userActivity={rowData.userActivity}
      />
    );
  }

  renderVolunteerListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.name }
        icon={ this.state.icons.volunteer_opportunity[rowID] }
        points={ Math.max(rowData.points || 1, 1) }
        onClick={ () => this.onPressedVolunteerCell(rowData) }
        userActivity={rowData.userActivity}
      />
    );
  }

  renderServicesListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.name }
        icon={ this.state.icons.service[rowID] }
        points={ Math.max(Number(rowData.points || 1), 1) }
        onClick={ () => this.onPressedServiceCell(rowData) }
        userActivity={rowData.userActivity}
      />
    );
  }


  get showActions() {
    if(this.state.community.actionsEnabled === false) return null;
    return(
      this.state.activities.action.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>{this.state.community.actionsTitle||'Actions'}</Text>
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
    if(this.state.community.placesEnabled === false) return null;
    return (
      this.state.activities.business.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>{this.state.community.placesTitle||'Businesses'}</Text>
          </View>
          <ListView
            enableEmptySections={ true }
            dataSource={ this.dataSource.cloneWithRows(this.state.activities.business) }
            renderRow={ this.renderBusinessesListRow.bind(this) }
            contentContainerStyle={ styles.listViewWrapper }/>
        </View>
      :
        null
    );
  }

  get showEvents() {
    if(this.state.community.eventsEnabled === false) return null;
    return (
      this.state.activities.event.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>{this.state.community.eventsTitle||'Events'}</Text>
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
    if(this.state.community.volunteerOpportunitiesEnabled === false) return null;
    return (
      this.state.activities.volunteer_opportunity.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>{this.state.community.volunteerOpportunitiesTitle||'Volunteer Opportunities'}</Text>
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
    if(this.state.community.servicesEnabled === false) return null;
    return (
      this.state.activities.service.length ?
        <View>
          <View style={ styles.sectionHeaderContainer }>
            <Text style={ styles.textSectionTitle }>{this.state.community.servicesTitle||'Services'}</Text>
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

  render() {
    const { status } = this.props;

    if (this.state.totalCount > 0) {
      return (
        <KeyboardAwareScrollView>
          { this.showActions }
          { this.showBusinesses }
          { this.showEvents }
          { this.showVolunteer }
          { this.showServices }
        </KeyboardAwareScrollView>
      )
    } else {
      return (
        <View style={ styles.emptyPage }>
          <Text style={ styles.noResultText }>No matches found</Text>
        </View>
      )
    }
  }
}

export default connect(state => ({
  status: state.search.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(searchActions, dispatch)
  })
)(FilterSearch);

const styles = StyleSheet.create({
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
  emptyPage: {
    flex:1,
    alignItems: 'center',
  },
  noResultText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Semibold',
    color: commonColors.grayMoreText,
    textAlign: 'center',
    lineHeight: 30,
    marginTop: 50,
  }
});

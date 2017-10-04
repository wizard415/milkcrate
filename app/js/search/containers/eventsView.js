'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as searchActions from '../actions';
import { connect } from 'react-redux';

import { Actions } from 'react-native-router-flux';
import CalendarStrip from '../components/calendar/calendarStrip';
import NavSearchBar from '../../components/navSearchBar';
import * as commonColors from '../../styles/commonColors';
import * as commonStyles from '../../styles/commonStyles';
import EventsListCell from '../components/eventsListCell';

import UtilService from '../../components/util'
import Cache from '../../components/Cache'
import bendService from '../../bend/bendService'
import * as _ from 'underscore'

import { EventsEntries } from '../../components/dummyEntries';

var dataSource = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2
});

class EventsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      selectedDate: undefined,

      arrayValidDate: [],
      eventDays: [],
     
      currentLocation: null,
      events: [],

      categoryIcons:[],
      eventsQuery: {
        more: true,
        loading: true,
      },
    };

    this.eventDays = [];
    this.events = [];
    this.initialEvents = [];
    this.offset = 0;
    this.limit = 1000; //need to fetch all events
    this.searchText = '';
    this.more = true;
  }

  componentDidMount() {
    this.hasMounted = true
    this.loadAllData();
    UtilService.mixpanelEvent("Browsed Events")
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  loadAllData() {
    this.hasMounted && this.setState({
      arrayValidDate: [],
      eventDays: [],

      currentLocation: null,
      events: [],

      categoryIcons: [],
      eventsQuery: {
        more: true,
        loading: true,
      },
    });

    this.eventDays = [];
    this.events = [];
    this.initialEvents = [];
    this.offset = 0;
    this.limit = 1000; 
    this.searchText = '';
    this.more = true;

    this.loadEvents();
  }

  onBack() {
    Actions.pop()
  }

  onFilter() {
    alert("Tapped filter button!");
  }

  onCellPressed(event) {
    Actions.EventDetail({ event: event });
  }

  onSelectDate(selectedDate) {
    let newEvents = [];
    this.hasMounted && this.setState({ selectedDate });

    _.each(this.events, (event) => {

      if (this.compareDates(event.date, selectedDate) == false)
        return;
      
      newEvents.push(event);
    })

    this.hasMounted && this.setState({ events: newEvents });
  }

  compareDates( firstDate, secondDate) {
    const date1 = new Date(firstDate);
    const date2 = new Date(secondDate);

    var timeDiff = date1 - date2;
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return diffDays < 0 ? false : true;
  }

  loadEvents() {
    if (this.more == false)
      return;

    this.hasMounted && this.setState( (state) => {
      state.eventsQuery.loading = true;
      return state;
    });

    navigator.geolocation.getCurrentPosition( 
      (position) => {
        this.search(position)
      },
      (error) => {
        console.log(JSON.stringify(error));
        this.search(null)
      },
        Platform.OS === 'ios'?{ enableHighAccuracy: commonStyles.geoLocation.enableHighAccuracy, timeout: commonStyles.geoLocation.timeout, maximumAge: commonStyles.geoLocation.maximumAge }:null
    );
  }

  search(position) {
    if (position) {
      this.hasMounted && this.setState({ currentLocation: position })
    }

    let params = {
      type: 'event',
      offset: this.offset,
      limit: this.limit,
      query: this.searchText,
      from: UtilService.formatDateWithFormat(Date.now() * 1000000, "YYYY-MM-DD")
    }

    if(_.isEqual(params, this.oldParam)) {
      return;
    }

    this.oldParam = params

    if (position) {
      params.lat = position.coords.latitude;
      params.long = position.coords.longitude;
    } else if (Cache.community && Cache.community._geoloc) {
      params.lat = Cache.community._geoloc[1];
      params.long = Cache.community._geoloc[0];
    }

    bendService.searchActivity(params, (error, result) => {

      //console.log("search events", params, error, result)

      this.hasMounted && this.setState( (state) => {
        state.eventsQuery.loading = false;
        return state;
      });

      this.hasMounted && this.setState({ isRefreshing: false });

      if (error) {
        console.log("search failed", error)
        return
      }

      if (result.data.event.length < this.limit) {
        this.more = false;
        this.hasMounted && this.setState( (state) => {
          state.eventsQuery.more = false;
          return state;
        });
      }

      this.offset += this.limit;

      this.initialEvents = result.data.event;
      this.groupEventsByDate(this.initialEvents)
    })
  }

  groupEventsByDate(initialEvents) {
    //group by with date
    this.events = [];
    this.eventDays= [];
    this.hasMounted && this.setState({ selectedDate: undefined });
    
    _.map(initialEvents, (event) => {
      event.date = UtilService.formatDateWithFormat(event.startsAt, "YYYY-MM-DD");
    })
    let events = _.sortBy(initialEvents, (event) => {
      return event.date
    })

    _.each(events, (event) => {
      var exist = _.find(this.events, (entry) => {
        return entry.date == event.date;
      })

      if (exist) {
        exist.events.push(event);
      } else {
        this.events.push({
          date: event.date,
          events: [event],
        })
      }
    })

    this.hasMounted && this.setState({ events: this.events });

    console.log("events", this.events)

    this.events.map( (entry) => {
      this.eventDays.push( entry.date );
    });

    this.hasMounted && this.setState({ eventDays: this.eventDays });

    /*initialEvents.map((event, index) => {
      this.hasMounted && this.setState( (state) => {
        state.categoryIcons[event._id] = UtilService.getCategoryIconFromSlug(event);
        return state;
      });
    });*/
  }

  renderListRow(rowData, sectionID, rowID) {
    if (typeof rowData == 'string') {
      return null;
    }
    return (
      <View>
        {
          rowData.map((entry, index) => {
            return (
              <EventsListCell
                key={ index }
                title={ entry.name }
                icon={ UtilService.getCategoryIconFromSlug(entry) }
                points={ Number(entry.points || 1) }
                onClick={ () => this.onCellPressed(entry) }
                userActivity={entry.userActivity}
              />
            );
          })
        }
      </View>
    );
  }

  renderSectionHeader(sectionData, sectionId) {
    return (
      <View style={ styles.sectionHeaderContainer }>
        <Text style={ styles.textTitle }>{ UtilService.formatDateWithFormat2(sectionData.date, "MMMM DD, YYYY") }</Text>
      </View>
    );
  }

  onSearchCancel() {
    this.onSearchChange('');
  }

  onSearchChange(text) {
    this.searchText = text;
    let newEvents;
    if (this.searchText === '') {
      newEvents = this.initialEvents;
    } 
    else {
      newEvents = _.filter(this.initialEvents, (event) => {
        console.log('event : ', event);
        if (event.name.toLowerCase().indexOf(this.searchText.toLowerCase()) != -1) {
          return true;
        }

        return false;
      });
    }

    this.groupEventsByDate(newEvents);  
  }

  get showActivity() {
    return (
      <ActivityIndicator
        hidesWhenStopped={ true }
        animating={ !this.state.isRefreshing && this.state.eventsQuery.loading }
        style={ styles.activityIndicator }
      />
    );
  }

  onRefresh() {
    this.hasMounted && this.setState({ isRefreshing: true });
    this.loadAllData();    
  }

  render() {

    return (
      <View style={ styles.container }>
        <NavSearchBar
          buttons={ commonStyles.NavBackButton }
          onBack={ this.onBack }
          onSearchChange={ (text) => this.onSearchChange(text) }
          onCancel={ () => this.onSearchCancel() }
          placeholder ='Search for events'
        />
        <CalendarStrip
          style={ styles.calendar }
          selection={ 'background' }
          calendarColor={ '#d4ebf640' }
          dateNumberStyle={ styles.calendarDateNumber }
          dateNameStyle={ styles.calendarDateName }
          highlightColor={ '#d4ebf6' }
          calendarHeaderStyle={ styles.calendarHeader }
          iconStyle={ styles.calendarIcon }
          iconContainer={{ flex: 0.1 }}
          weekendDateNameStyle={ styles.calendarDateName }
          weekendDateNumberStyle={ styles.calendarDateNumber }
          highlightDateNameStyle={ styles.calendarDateName }
          highlightDateNumberStyle={ styles.calendarDateNumber }
          onDateSelected={ (date) => this.onSelectDate(date) }
          eventDays={ this.state.eventDays }
          selectedDate={ this.state.selectedDate }
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
          <ListView
            enableEmptySections={ true }
            dataSource={ dataSource.cloneWithRowsAndSections(this.state.events)}
            renderRow={ this.renderListRow.bind(this) }
            renderSectionHeader= { this.renderSectionHeader.bind(this) }
          />
          { this.showActivity }
        </ScrollView>
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
)(EventsView);

const styles = StyleSheet.create({
  container: {
    flex : 1,
  },
  calendar: {
    paddingVertical: 10,
  },
  calendarDateNumber: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 10,
  },
  calendarDateName: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 8,
  },
  calendarHeader: {
    color: commonColors.grayText,
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 10,
  },
  calendarIcon: {
    width: 7,
    height: 14,
  },
  sectionHeaderContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    height: commonStyles.hp(8),
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    borderStyle: 'solid',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  textTitle: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
  },
  activityIndicator: {
    marginTop: 10,
    flex: 1,
  },
});

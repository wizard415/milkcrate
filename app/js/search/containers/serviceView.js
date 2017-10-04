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
  RefreshControl,
  Alert,
  Platform
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as searchActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';

import NavSearchBar from '../../components/navSearchBar';

import Cache from '../../components/Cache'
import UtilService from '../../components/util'
import bendService from '../../bend/bendService'

import BusinessesListCell from '../components/businessesListCell';
import EventsListCell from '../components/eventsListCell';

import * as commonColors from '../../styles/commonColors';
import  * as commonStyles from '../../styles/commonStyles';
import * as _ from 'underscore'

import LoadMoreSpinner from '../../components/loadMoreSpinner';

class ServiceView extends Component {
  constructor(props) {
    super(props);

    this.dataSource = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.offset = 0;
    this.limit = 20;
    this.searchText = '';
    this.more = true;

    this.state = {
      isRefreshing: false,

      currentLocation: null,
      services: [],
      categoryIcons: [],
      serviceQuery: {
        more: true,
        loading: false,
      },
    };
  }

  componentDidMount() {
    this.hasMounted = true
    this.loadAllData();
    UtilService.mixpanelEvent("Browsed Services")
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  loadAllData() {
    this.offset = 0;
    this.limit = 20;
    this.searchText = '';
    this.more = true;

    this.hasMounted && this.setState({
      currentLocation: null,
      services: [],
      categoryIcons: [],
      serviceQuery: {
        more: true,
        loading: false,
      },
    });

    this.loadServices();
  }

  onBack() {
    Actions.pop()
  }

  onPressedCell (service) {
    Actions.ServiceDetail({
      service: service
    })
  }

  loadServices () {
    if (this.more == false)
      return;

    this.hasMounted && this.setState( (state) => {
      state.serviceQuery.loading = true;
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
    if(position)
      this.hasMounted && this.setState({ currentLocation: position })

    var param = {
      type: 'service',
      offset: this.offset,
      limit: this.limit,
      query: this.searchText
    }

    if(_.isEqual(param, this.oldParam)) {
      return;
    }

    this.oldParam = param

    if(position) {
      param.lat = position.coords.latitude;
      param.long = position.coords.longitude;
    } else {
      if(Cache.community && Cache.community._geoloc) {
        param.lat = Cache.community._geoloc[1];
        param.long = Cache.community._geoloc[0];
      }
    }

    bendService.searchActivity(param, (error, result) => {
      if(param.query != this.searchText) return;
      this.hasMounted && this.setState( (state) => {
        state.serviceQuery.loading = false;
        return state;
      });

      this.hasMounted && this.setState({ isRefreshing: false });

      if (error) {
        console.log("search failed", error)
        return
      }

      if (result.data.service.length < this.limit) {
        this.more = false;
        this.hasMounted && this.setState( (state) => {
          state.serviceQuery.more = false;
          return state;
        });
      }

      this.state.services = this.state.services.concat(result.data.service);
      this.hasMounted && this.setState({ services: this.state.services });

      const imageOffset = this.offset;
      this.offset += this.limit;

      result.data.service.map( (service, index) => {
        this.hasMounted && this.setState( (state) => {
          state.categoryIcons[imageOffset + index] =  UtilService.getCategoryIconFromSlug(service);
          return state;
        });
      });
    })
  }

  renderListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.name }
        icon={ this.state.categoryIcons[rowID]||UtilService.getMilkCrateLogo() }
        points={ Math.max(rowData.points || 1, 1) }
        onClick={ () => this.onPressedCell(rowData) }
        userActivity={rowData.userActivity}
      />
    );
  }

  onSearchChange(text) {
    this.searchText = text
    setTimeout((oldSearchText)=>{
      if(oldSearchText == this.searchText) {
        this.state.services = [];
        this.offset = 0;
        this.limit = 20;
        this.more = true;

        this.hasMounted && this.setState({
          currentLocation: null,
          services: this.state.services,
          categoryIcons: [],

          serviceQuery:{
            more: true,
            loading: false,
          },
        });

        this.loadServices();
      }
    }, 300, text)
  }
  // onSearchFocus() {

  //   this.offset = 0;
  //   this.more = false;
  //   this.actions = [];

  //   this.setState( (state) => {
  //     state.serviceQuery.more = false;
  //     state.services = [];
  //     state.categoryIcons = [];
  //     return state;
  //   })
  // }

  onSearchCancel() {
    this.offset = 0;
    this.searchText = '';
    this.more = true;

    this.hasMounted && this.setState( (state) => {
      state.serviceQuery.more = true;
      state.services = [];
      state.categoryIcons = [];
      return state;
    })

    this.loadServices();
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
          placeholder={ 'Search for services' }
          onSearchChange={ (text) => this.onSearchChange(text) }
          onCancel={ () => this.onSearchCancel() }
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
            dataSource={ this.dataSource.cloneWithRows(this.state.services) }
            renderRow={ this.renderListRow.bind(this) }
            contentContainerStyle={ styles.listViewWrapper }
          />
          { 
            !this.state.isRefreshing && 
            <LoadMoreSpinner
              show={ this.state.serviceQuery.more }
              loading={ this.state.serviceQuery.loading }
              onClick={ ()=> this.loadServices() }
            />
          }
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
)(ServiceView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listViewWrapper: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
  },
});

'use strict';

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Keyboard,
    Alert,
    Platform
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as searchActions from '../actions';
import { connect } from 'react-redux';

import { Actions } from 'react-native-router-flux';
import { SegmentedControls } from 'react-native-radio-buttons';

import NavSearchBar from '../../components/navSearchBar';
import BusinessesListView from './businessesListView';
import BusinessesMapView from './businessesMapView';

import  * as commonStyles from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';

const currentLocation = require('../../../assets/imgs/current_location_button.png');

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'
import Cache from '../../components/Cache'

class BusinessesView extends Component {
  constructor(props) {
    super(props);

    this.businesses = [];
    this.offset = 0;
    this.limit = 20;
    this.searchText = '';
    this.more = true;

    this.state = {
      isRefreshing: false,

      selectedIndex: 'List',
      currentLocation: null,
      businesses: [],
      categoryIcons: [],

      searchMode: true,
      searchAutoFocus: false,

      businessesQuery:{
        more: true,
        loading: false,
      },
    };
  }

  componentDidMount() {
    this.hasMounted = true
    this.loadAllData();
    UtilService.mixpanelEvent("Browsed Businesses")
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  loadAllData() {
    this.businesses = [];
    this.offset = 0;
    this.limit = 20;
    this.searchText = '';
    this.more = true;

    this.hasMounted && this.setState({
      selectedIndex: 'List',
      currentLocation: null,
      businesses: [],
      categoryIcons: [],

      businessesQuery:{
        more: true,
        loading: false,
      },
    });

    this.loadBusinesses();
  }

  onBack() {
    Actions.pop()
  }

  onFilter() {
    alert("Tapped filter button!");
  }

  onCurrentLocation() {
    navigator.geolocation.getCurrentPosition( 
      (position) => {
        console.log("current location business view", position)
        this.hasMounted && this.setState({ currentLocation: position });
      },
      (error) => {
        console.log(JSON.stringify(error));
      },
        Platform.OS === 'ios'?{ enableHighAccuracy: commonStyles.geoLocation.enableHighAccuracy, timeout: commonStyles.geoLocation.timeout, maximumAge: commonStyles.geoLocation.maximumAge }:null
    );
  }

  loadBusinesses() {
    if (this.more === false)
      return;

    this.hasMounted && this.setState( (state) => {
      state.businessesQuery.loading = true;
      return state;
    });

    navigator.geolocation.getCurrentPosition( 
      (position) => {
        console.log("current location business view", position)
        this.search(position);
      },
      (error) => {
        console.log("current location business view error", JSON.stringify(error));
        this.search(null);
      }
        ,
        Platform.OS === 'ios'?{ enableHighAccuracy: commonStyles.geoLocation.enableHighAccuracy, timeout: commonStyles.geoLocation.timeout, maximumAge: commonStyles.geoLocation.maximumAge }:null
    );
  }

  search(position) {
    if (position)
      this.hasMounted && this.setState({ currentLocation: position })

    var param = {
      type: 'business',
      offset: this.offset,
      limit: this.limit,
      query: this.searchText,
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
      if (param.query != this.searchText)
        return;

      console.log("searchActivity", result.data.business.length)

      this.hasMounted && this.setState( (state) => {
        state.businessesQuery.loading = false;
        return state;
      });

      this.hasMounted && this.setState({ isRefreshing: false });

      if (error) {
        console.log("search failed", error)
        return
      }

      if (result.data.business.length < this.limit) {
        this.more = false;
        this.hasMounted && this.setState( (state) => {
          state.businessesQuery.more = false;
          return state;
        });
      }

      if(this.offset == 0)
        this.businesses = result.data.business;
      else {
        this.businesses = this.businesses.concat(result.data.business);
      }

      this.hasMounted && this.setState({
        businesses: this.businesses,
      });

      const imageOffset = this.offset;
      this.offset += this.limit;

      result.data.business.map( (business, index) => {
        this.hasMounted && this.setState( (state) => {
          state.categoryIcons[imageOffset + index] = UtilService.getCategoryIconFromSlug(business);
          return state;
        })
      });
    })
  }

  onSearchChange(text) {
    this.searchText = text
    setTimeout((oldSearchText)=>{
      if(oldSearchText == this.searchText) {
        this.businesses = [];
        this.state.businesses = [];
        this.offset = 0;
        this.limit = 20;
        this.more = true;

        this.hasMounted && this.setState({
          currentLocation: null,
          businesses: this.state.businesses,
          categoryIcons: [],

          businessesQuery:{
            more: true,
            loading: false,
          },
        });

        this.loadBusinesses();
      }
    }, 300, text)
  }

  onSearchCancel() {

    if (this.state.selectedIndex ===  'Map') {
      this.hasMounted && this.setState({ selectedIndex: 'List' });
    }

    this.offset = 0;
    this.searchText = '';
    this.more = true;
    this.businesses = [];
    this.state.businesses = [];

    this.hasMounted && this.setState( (state) => {
      state.businessesQuery.more = true;
      state.businesses = [];
      state.categoryIcons = [];

      return state;
    })

    this.loadBusinesses();
  }

  onRefresh() {
    this.hasMounted && this.setState({ isRefreshing: true });
    this.loadAllData();
  }

  onSelectSegment(option) {

    Keyboard.dismiss();

    if (this.businesses.length === 0) {
      this.hasMounted && this.setState({ selectedIndex: 'List' });
      return;
    }

    this.hasMounted && this.setState({
      selectedIndex: option,
    });

    let searchMode = false;

    if (option === 'List') {
      searchMode = true;
    }

    this.hasMounted && this.setState({
      searchMode: searchMode,
      searchAutoFocus: false,
    });
  }

  onGoSearchScreen() {

    this.onSelectSegment('List');

    this.hasMounted && this.setState({
      searchAutoFocus: true,
    });
  }

  onSearchFocus() {
    this.hasMounted && this.setState({
      searchAutoFocus: false,
    });
  }

  render() {
    return (
      <View style={ styles.container }>
        <NavSearchBar
          buttons={ commonStyles.NavBackButton }
          onBack={ this.onBack }
          placeholder={ 'Search for businesses' }
          onSearchChange={ (text) => this.onSearchChange(text) }
          onCancel={ () => this.onSearchCancel() }
          onFocus={ () => this.onSearchFocus() }
          searchMode={ this.state.searchMode }
          onGoSearchScreen={ () => this.onGoSearchScreen() }
          searchAutoFocus={ this.state.searchAutoFocus }
        />
        <View style={ styles.segmentedWrap }>
          <View style={ styles.segmentedLeft }/>
          <View style={ styles.segmented }>
            <SegmentedControls
              tint={ '#fff' }
              selectedTint= { commonColors.theme }
              backTint= { commonColors.theme }
              options={ ['List', 'Map'] }
              allowFontScaling={ false } // default: true
              onSelection={ (option) => this.onSelectSegment(option) }
              selectedOption={ this.state.selectedIndex }
            />
          </View>
          <View style={ styles.segmentedRight }>
            {
              this.state.selectedIndex == 'Map' ?
                <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onCurrentLocation() }>
                  <Image style={ styles.imageCurrentLocation } source={ currentLocation }/>
                </TouchableOpacity>
                :
                null
            }
          </View>
        </View>
        {
          this.state.selectedIndex == 'List' ?
            <BusinessesListView
              businesses={ this.state.businesses }
              currentLocation={ this.state.currentLocation }
              moreBusinesses={ this.state.businessesQuery.more }
              loading={ this.state.businessesQuery.loading }
              onLoadBusinesses={ () => this.loadBusinesses() }
              isRefreshing={ this.state.isRefreshing }
              onRefresh={ () => this.onRefresh() }
            />
            :
            <BusinessesMapView
              businesses={ this.state.businesses }
              currentLocation={ this.state.currentLocation }
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
)(BusinessesView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: commonStyles.screenWidth,
    height: commonStyles.screenHeight,
  },
  segmentedWrap: {
    flexDirection: 'row',
    backgroundColor: commonColors.theme,
    height: 44,
  },
  segmented: {
    flex: 6,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedLeft: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  segmentedRight: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  imageCurrentLocation: {
    width: 20,
    height: 22,
  },
  tabStyle: {
    borderWidth: 1,
    borderColor: '#fff',
    borderStyle: 'solid',
    backgroundColor: commonColors.theme,
  },
  tabTextStyle: {
    color: '#fff',
  },
  activeTabStyle: {
    borderWidth: 1,
    borderColor: '#fff',
    borderStyle: 'solid',
    backgroundColor: '#fff',
  },
  activeTabTextStyle: {
    color: commonColors.theme,
  },
});

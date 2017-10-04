'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as searchActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';

import MapView from 'react-native-maps';
import BusinessesListCell from '../components/businessesListCell';
import { screenWidth, screenHeight } from '../../styles/commonStyles';

import UtilService from '../../components/util'

const ASPECT_RATIO = screenWidth / screenHeight;
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const map_pin = require('../../../assets/imgs/map_marker.png');
const map_selected_pin = require('../../../assets/imgs/map_marker_selected.png');
const currentLocationMarker = require('../../../assets/imgs/current_location_marker.png');

class BusinessesMapView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentLocation: null,
      markers: [],
      tappedPin: 0,
    };

    this.latitudeDelta = LATITUDE_DELTA;
    this.longitudeDelta = LONGITUDE_DELTA;
    this.currentRegion = null;
    this.watchID = null;
  }  

  componentDidMount() {
    this.hasMounted = true
    this.hasMounted && this.setState( ( state) => {
      this.props.businesses.map( (business, index) => {
        state.markers[index] = {
          pin: map_pin,
          coordinate: {
            latitude: business._geoloc[1],
            longitude: business._geoloc[0],
          },
        };
      })
      state.markers[this.state.tappedPin].pin = map_selected_pin;
      return state;
    });

    UtilService.mixpanelEvent("Viewed Business Map View")
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  componentWillReceiveProps(nextProps) {

    this.hasMounted && this.setState({ currentLocation: nextProps.currentLocation });
  }

  onPressPin (index) {
    this.hasMounted && this.setState( ( state) => {
      state.markers[this.state.tappedPin].pin = map_pin;
      state.markers[index].pin = map_selected_pin;
      return state;
    });

    this.hasMounted && this.setState({
      tappedPin: index,
      currentLocation: null 
    });
  }

  onPressedCell (rowData) {
    Actions.BusinessesDetail({ business: rowData });
  }

  onRegionChange( region ) {
    this.currentRegion = region;
    this.latitudeDelta = this.currentRegion.latitudeDelta;
    this.longitudeDelta = this.currentRegion.longitudeDelta;
  }

  render() {
    const { 
      businesses,
    } = this.props;

    let region = null;

    if (this.state.currentLocation != null) {
      region = {
        latitude: this.state.currentLocation.coords.latitude,
        longitude: this.state.currentLocation.coords.longitude,
        latitudeDelta: this.latitudeDelta,
        longitudeDelta: this.longitudeDelta,
      };
    } 
    else if ( this.currentRegion === null) {
      region = {
        latitude: businesses[this.state.tappedPin]._geoloc[1],
        longitude: businesses[this.state.tappedPin]._geoloc[0],
        latitudeDelta: this.latitudeDelta,
        longitudeDelta: this.longitudeDelta,
      };
    }

    let distance = 0;
    if ((businesses[this.state.tappedPin]._geoloc) && (this.props.currentLocation)) {
      distance = UtilService.getDistanceFromLatLonInMile(businesses[this.state.tappedPin]._geoloc[1], businesses[this.state.tappedPin]._geoloc[0],
            this.props.currentLocation.coords.latitude, this.props.currentLocation.coords.longitude);
    }

    return (
      <View style={ styles.container }>
        <MapView
          style={ styles.map }
          region={ region }
          showsMyLocationButton={ false }
          showsPointsOfInterest={ false }
          loadingEnabled={ true }
          onRegionChange={ (region) => this.onRegionChange(region) }
        >
          {
            this.props.currentLocation && <MapView.Marker
              image={ currentLocationMarker }
              coordinate={ this.props.currentLocation.coords }
              flat={ true }                
            />
          }
          {
            this.state.markers.map( (marker, index) => (
              <MapView.Marker
                key={ index }
                image={ marker.pin }
                coordinate={ marker.coordinate }
                flat={ true }
                onPress={ () => this.onPressPin(index) }
              />
            ))     
          }          
        </MapView>
        <View style={ styles.calloutContainer }>
          <BusinessesListCell
            title={ businesses[this.state.tappedPin].name }
            icon={ UtilService.getCategoryIconFromSlug(businesses[this.state.tappedPin]) }
            description={ businesses[this.state.tappedPin].description }
            distance={ distance }
            price={ Number(businesses[this.state.tappedPin].priceTier) }
            rating={ Number(businesses[this.state.tappedPin].rating || 0) }
            onClick={ () => this.onPressedCell(businesses[this.state.tappedPin]) }
            userActivity={businesses[this.state.tappedPin].userActivity}
            mode={ 1 }
          />
        </View>
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
)(BusinessesMapView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  calloutContainer: {
    position: 'absolute',
    bottom: 10,
    marginHorizontal: 10,
  },
});
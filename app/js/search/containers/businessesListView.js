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
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as searchActions from '../actions';
import { connect } from 'react-redux';

import { Actions } from 'react-native-router-flux';

import BusinessesListCell from '../components/businessesListCell';
import * as commonColors from '../../styles/commonColors';
import LoadMoreSpinner from '../../components/loadMoreSpinner';

import UtilService from '../../components/util'

class BusinessesListView extends Component {
  constructor(props) {
    super(props);

    this.dataSource = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

  }

  onPressedCell (rowData) {
    Actions.BusinessesDetail({ business: rowData });
  }

  renderRow(rowData, sectionID, rowID) {
    const caetgoriIcon = UtilService.getCategoryIconFromSlug(rowData);

    return (
      <BusinessesListCell
        title={ rowData.name }
        icon={ caetgoriIcon }
        description={ rowData.description }
        distance={ rowData._geoloc && this.props.currentLocation ? UtilService.getDistanceFromLatLonInMile(rowData._geoloc[1], rowData._geoloc[0],
        this.props.currentLocation.coords.latitude, this.props.currentLocation.coords.longitude) : null }
        price={ Number(rowData.priceTier) }
        rating={ Number(rowData.rating || 0) }
        onClick={ () => this.onPressedCell(rowData) }
        userActivity={rowData.userActivity}
      />
    );
  }

  render() {
    const { 
      businesses,
      onLoadBusinesses,
      moreBusinesses,
      loading,
      isRefreshing,
      onRefresh,
    } = this.props;

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={ isRefreshing }
            onRefresh={ () => onRefresh() }
            tintColor={ commonColors.theme }
          />
        }
      >
        <ListView
          enableEmptySections={ true }
          dataSource={ this.dataSource.cloneWithRows(businesses) }
          renderRow={ this.renderRow.bind(this) }
          contentContainerStyle={ styles.categoryDetailListView }
        />
        {
          !isRefreshing &&
          <LoadMoreSpinner
            show={ moreBusinesses }
            loading={ loading }
            onClick={ ()=> onLoadBusinesses() }
          />
        }
      </ScrollView>
    );
  }
}

export default connect(state => ({
  status: state.search.status
  }),
  (dispatch) => ({
    actions: bindActionCreators(searchActions, dispatch)
  })
)(BusinessesListView);

const styles = StyleSheet.create({
  categoryDetailListView: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
  },
});
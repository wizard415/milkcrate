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

import NavSearchBar from '../../components/navSearchBar';
import EventsListCell from '../components/eventsListCell';
import LoadMoreSpinner from '../../components/loadMoreSpinner';
import * as commonColors from '../../styles/commonColors';
import  * as commonStyles from '../../styles/commonStyles';

import UtilService from '../../components/util'
import bendService from '../../bend/bendService'
import * as _ from 'underscore'

class ActionView extends Component {
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
      actions: [],
      categoryIcons: [],

      actionsQuery: {
        more: true,
        loading: false,
      },
    };
  }

  componentDidMount() {
    this.hasMounted = true
    this.loadAllData();
    UtilService.mixpanelEvent("Browsed Actions")
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  onBack() {
    Actions.pop()
  }

  onPressedActionsCell (action) {
    Actions.ActionDetail({
      action: action
    })
  }

  loadAllData() {
    this.offset = 0;
    this.limit = 20;
    this.searchText = '';
    this.more = true;

    this.hasMounted && this.setState({
      currentLocation: null,
      actions: [],
      categoryIcons: [],
      actionsQuery: {
        more: true,
        loading: false,
      },
    });

    this.loadActions();
  }

  loadActions () {
    if (this.more == false)
      return;

    this.hasMounted && this.setState( (state) => {
      state.actionsQuery.loading = true;
      return state;
    });

    /*navigator.geolocation.getCurrentPosition( 
      (position) => {
        this.setState({ currentLocation: position })
      },
      (error) => {
        console.log(JSON.stringify(error));
      },
      { enableHighAccuracy: commonStyles.geoLocation.enableHighAccuracy, timeout: commonStyles.geoLocation.timeout, maximumAge: commonStyles.geoLocation.maximumAge }
    );*/

    var searchText = this.searchText
    var param = {
      type: 'action',
      offset: this.offset,
      limit: this.limit,
      query: this.searchText
    }

    if(_.isEqual(param, this.oldParam)) {
      return;
    }

    this.oldParam = param

    bendService.searchActivity(param, (error, result) => {
      if(searchText != this.searchText) {
        return;
      }

      this.hasMounted && this.setState( (state) => {
        state.actionsQuery.loading = false;
        return state;
      });

      this.hasMounted && this.setState({ isRefreshing: false });

      if (error) {
        console.log("search failed", error)
        return
      }

      if (result.data.action.length < this.limit) {
        this.more = false;
        this.hasMounted && this.setState( (state) => {
          state.actionsQuery.more = false;
          return state;
        });
      }

      this.state.actions = this.state.actions.concat(result.data.action);
      this.hasMounted && this.setState({ actions: this.state.actions });

      const imageOffset = this.offset;
      this.offset += this.limit;

      result.data.action.map( (action, index) => {

        this.hasMounted && this.setState( (state) => {
          state.categoryIcons[imageOffset + index] = UtilService.getCategoryIconFromSlug(action);
          return state;
        });

      });
    })
  }

  renderActionsListRow(rowData, sectionID, rowID) {
    return (
      <EventsListCell
        title={ rowData.name }
        icon={ this.state.categoryIcons[rowID] }
        points={ Math.max(rowData.points || 1, 1) }
        onClick={ () => this.onPressedActionsCell(rowData) }
        userActivity={rowData.userActivity}
      />
    );
  }

  onSearchChange(text) {
    this.searchText = text
    setTimeout((oldSearchText)=>{
      if (oldSearchText == this.searchText) {
        this.state.actions = [];
        this.offset = 0;
        this.limit = 20;
        this.more = true;

        this.hasMounted && this.setState({
          currentLocation: null,
          actions: this.state.actions,
          categoryIcons: [],

          actionsQuery:{
            more: true,
            loading: false,
          },
        });

        this.loadActions();
      }
    }, 300, text)
  }

  onSearchCancel() {
    this.offset = 0;
    this.searchText = '';
    this.more = true;

    this.hasMounted && this.setState( (state) => {
      state.actionsQuery.more = true;
      state.actions = [];
      state.categoryIcons = [];
      return state;
    })

    this.loadActions();
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
          placeholder={ 'Search for actions' }
          onSearchChange={ (text) => this.onSearchChange(text) }
          onCancel={ () => this.onSearchCancel() }
          query={ this.searchText }
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
            dataSource={ this.dataSource.cloneWithRows(this.state.actions) }
            renderRow={ this.renderActionsListRow.bind(this) }
            contentContainerStyle={ styles.listViewWrapper }
          />
          {
           !this.state.isRefreshing && <LoadMoreSpinner
              show={ this.state.actionsQuery.more }
              loading={ this.state.actionsQuery.loading }
              onClick={ ()=> this.loadActions() }
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
)(ActionView);

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

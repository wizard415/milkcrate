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
  ListView,
  TouchableOpacity,
  NetInfo,
  Alert,
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as searchActions from '../actions';
import { connect } from 'react-redux';

import { Actions } from 'react-native-router-flux';
import NavSearchBar from '../../components/navSearchBar';
import ImageButton from '../components/imageButton';
import CategoryButton from '../components/categoryButton';
import ExploreWaysListCell from '../components/exploreWaysListCell';
import { screenWidth, activityCellSize, categoryCellSize } from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';
import Cache from '../../components/Cache'
import UtilService from '../../components/util'
import bendService from '../../bend/bendService'
import * as _ from 'underscore'

const exploreWays = [
  {
    key: 'recent',
    title: 'Recent',
    description: 'See your most recent activities',
    icon: require('../../../assets/imgs/recent.png'),
    iconWidth: 21,
    iconHeight: 21,
    enabled:true,
  },
  {
    key: 'actions',
    title: 'Take Action',
    description: 'Explore easy, self-reported lifestyle behaviors',
    icon: require('../../../assets/imgs/actions.png'),
    iconWidth: 22,
    iconHeight: 22,
    enabled:true,
  },
  {
    key: 'businesses',
    title: 'Businesses',
    description: 'Check in to local, sustainable businesses nearby',
    icon: require('../../../assets/imgs/businesses.png'),
    iconWidth: 14,
    iconHeight: 21,
    enabled:true,
  },
  {
    key: 'events',
    title: 'Events',
    description: 'Register for green events and add to your calendar',
    icon: require('../../../assets/imgs/events.png'),
    iconWidth: 23,
    iconHeight: 25,
    enabled:true,
  },
  {
    key: 'services',
    title: 'Services',
    description: 'Sign up for eco-friendly lifestyle services',
    icon: require('../../../assets/imgs/services.png'),
    iconWidth: 23,
    iconHeight: 20,
    enabled:true,
  },
  {
    key: 'volunteer_opportunities', 
    title: 'Volunteer Opportunities',
    description: 'Find one that’s right for you',
    icon: require('../../../assets/imgs/volunteer.png'),
    iconWidth: 26,
    iconHeight: 25,
    enabled:true,
  },
];

const categoryTitles = [
  'Animals',
  'Baby',
  'Beauty',
  'Bicycles',
  'Civic',
  'Coffee',
  'Community',
  'Construction',
  'Dining',
  'Drinks',
  'Education',
  'Energy',
  'Fashion',
  'Finance',
  'Food',
  'Garden',
  'Green Space',
  'Health & Wellness',
  'Home & Office',
  'Media',
  'Products',
  'Services',
  'Special Events',
  'Tourism & Hospitality',
  'Transit',
  'Waste'
];

/*const categoryImages = [
  require('../../../assets/imgs/category-buttons/animals.png'),
  require('../../../assets/imgs/category-buttons/baby.png'),
  require('../../../assets/imgs/category-buttons/beauty.png'),
  require('../../../assets/imgs/category-buttons/bicycles.png'),
  require('../../../assets/imgs/category-buttons/civic.png'),
  require('../../../assets/imgs/category-buttons/coffee.png'),
  require('../../../assets/imgs/category-buttons/community.png'),
  require('../../../assets/imgs/category-buttons/construction.png'),
  require('../../../assets/imgs/category-buttons/dining.png'),
  require('../../../assets/imgs/category-buttons/drinks.png'),
  require('../../../assets/imgs/category-buttons/education.png'),
  require('../../../assets/imgs/category-buttons/energy.png'),
  require('../../../assets/imgs/category-buttons/fashion.png'),
  require('../../../assets/imgs/category-buttons/finance.png'),
  require('../../../assets/imgs/category-buttons/food.png'),
  require('../../../assets/imgs/category-buttons/garden.png'),
  require('../../../assets/imgs/category-buttons/green-space.png'),
  require('../../../assets/imgs/category-buttons/health-wellness.png'),
  require('../../../assets/imgs/category-buttons/home-office.png'),
  require('../../../assets/imgs/category-buttons/media-communications.png'),
  require('../../../assets/imgs/category-buttons/products.png'),
  require('../../../assets/imgs/category-buttons/services.png'),
  require('../../../assets/imgs/category-buttons/special-events.png'),
  require('../../../assets/imgs/category-buttons/tourism-hospitality.png'),
  require('../../../assets/imgs/category-buttons/transit.png'),
  require('../../../assets/imgs/category-buttons/waste.png'),
];

const categoryActiveImages = [
  require('../../../assets/imgs/category-buttons/animals_active.png'),
  require('../../../assets/imgs/category-buttons/baby_active.png'),
  require('../../../assets/imgs/category-buttons/beauty_active.png'),
  require('../../../assets/imgs/category-buttons/bicycles_active.png'),
  require('../../../assets/imgs/category-buttons/civic_active.png'),
  require('../../../assets/imgs/category-buttons/coffee_active.png'),
  require('../../../assets/imgs/category-buttons/community_active.png'),
  require('../../../assets/imgs/category-buttons/construction_active.png'),
  require('../../../assets/imgs/category-buttons/dining_active.png'),
  require('../../../assets/imgs/category-buttons/drinks_active.png'),
  require('../../../assets/imgs/category-buttons/education_active.png'),
  require('../../../assets/imgs/category-buttons/energy_active.png'),
  require('../../../assets/imgs/category-buttons/fashion_active.png'),
  require('../../../assets/imgs/category-buttons/finance_active.png'),
  require('../../../assets/imgs/category-buttons/food_active.png'),
  require('../../../assets/imgs/category-buttons/garden_active.png'),
  require('../../../assets/imgs/category-buttons/green-space_active.png'),
  require('../../../assets/imgs/category-buttons/health-wellness_active.png'),
  require('../../../assets/imgs/category-buttons/home-office_active.png'),
  require('../../../assets/imgs/category-buttons/media-communications_active.png'),
  require('../../../assets/imgs/category-buttons/products_active.png'),
  require('../../../assets/imgs/category-buttons/services_active.png'),
  require('../../../assets/imgs/category-buttons/special-events_active.png'),
  require('../../../assets/imgs/category-buttons/tourism-hospitality_active.png'),
  require('../../../assets/imgs/category-buttons/transit_active.png'),
  require('../../../assets/imgs/category-buttons/waste_active.png'),
];*/

class MainSearch extends Component {
  constructor(props) {
    super(props);

    this.dataSourceExploreWays = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.dataSourceCategories = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      exploreWays: _.clone(exploreWays),
      loading:true,
      community:{},
      categories:[]
    };

    this.categoryCellMargin = 0;
  }

  componentDidMount() {

    if (this.props.subOne != null) {

      let subOne = this.props.subOne;

      for (let i = 0 ; i < exploreWays.length ; i++) {
        if (exploreWays[i].key.toLowerCase() == subOne.toLocaleString()) {
          this.onSelectExploreWays ( i, this.props.query );
          return;
        }
      }

      for (let i = 0 ; i < categoryTitles.length ; i++) {
        if (categoryTitles[i].toLowerCase() == subOne.toLocaleString()) {
          this.onSelectCategory ( i );
          return;
        }
      }
    }

    bendService.getCommunity((err, ret)=>{
      if(err) {
        console.log(err);
        this.setState({
          loading:false
        })
        return
      }

      var exploreWays = this.state.exploreWays
      exploreWays[1].title = ret.actionsTitle||exploreWays[1].title
      exploreWays[1].description = ret.actionsDescription||exploreWays[1].description
      exploreWays[1].enabled = ret.actionsEnabled
      exploreWays[2].title = ret.placesTitle||exploreWays[2].title
      exploreWays[2].description = ret.placesDescription||exploreWays[2].description
      exploreWays[2].enabled = ret.placesEnabled
      exploreWays[3].title = ret.eventsTitle||exploreWays[3].title
      exploreWays[3].description = ret.eventsDescription||exploreWays[3].description
      exploreWays[3].enabled = ret.eventsEnabled
      exploreWays[4].title = ret.servicesTitle||exploreWays[4].title
      exploreWays[4].description = ret.servicesDescription||exploreWays[4].description
      exploreWays[4].enabled = ret.servicesEnabled
      exploreWays[5].title = ret.volunteerOpportunitiesTitle||exploreWays[5].title
      exploreWays[5].description = ret.volunteerOpportunitiesDescription||exploreWays[5].description
      exploreWays[5].enabled = ret.volunteerOpportunitiesEnabled

      this.setState({
        exploreWays:exploreWays,
        loading:false,
        community:ret
      })
    })

    bendService.getCategories((err, rets)=>{
      if(err) {
        console.log(err);
        return;
      }
      this.setState({
        categories:_.sortBy(rets, (o)=>{
          return o.name
        })
      })
    })
  }

  onSelectExploreWays (index, query) {

    switch (Number(index)) {
      case 0://Recent
        Actions.RecentView();
        break;

      case 1://Take Action
        Actions.ActionView({ query: query });
        break;

      case 2://Businesses
        Actions.BusinessesView({ query: query });
        break;

      case 3://Events
        Actions.EventsView({ query: query });
        break;
      case 4://Services
        Actions.ServiceView({ query: query });
        break;

      case 5://Volunteer
        Actions.VolunteerView({ query : query });
        break;

      default:
    }
  }

  onSelectCategory (cat) {

    Actions.CategoryView({ title: cat.name, category: cat });
  }

  renderExploreWaysRow(rowData, sectionID, rowID) {
    if(rowData.enabled === false)
        return null;
    return (
      <ExploreWaysListCell
        key={ rowID }
        title={ rowData.title }
        description={ rowData.description }
        icon={ rowData.icon }
        iconWidth={ rowData.iconWidth }
        iconHeight={ rowData.iconHeight }
        onClick={ () => this.onSelectExploreWays(rowID, null) }
      />
    );
  }

  renderCategoriesRow(rowData, sectionID, rowID) {
    if(!this.props.countByCategory[rowData._id])
        return null;
    
    return (
      <View style={ [styles.categoryCellWrap, { marginHorizontal: this.categoryCellMargin },] }>
        <View style={ styles.categoryCellButtonWrapper }>
          <ImageButton
            style={ styles.categoryCellImage }
            appearance={{
              normal: UtilService.getCategoryButton(rowData.slug),// categoryImages[rowID],
              highlight: UtilService.getCategoryButton(rowData.slug + '_active')
            }}
            onPress={ () => this.onSelectCategory(rowData) }
          />
          <Text style={ styles.cagegoryCellText }>
            { rowData.name }
          </Text>
        </View>
      </View>
    );
  }

  caculateCategoryCellMargin() {
    const cellNumber = Math.round(screenWidth / categoryCellSize);
    this.categoryCellMargin = ( screenWidth - categoryCellSize * cellNumber) / cellNumber / 2;
  }

  render() {
    this.caculateCategoryCellMargin();

    if(this.state.loading)
        return null;

    return (
      <ScrollView>
        <Text style={ styles.textTitle }>Explore Ways to Earn Points</Text>
        <ListView
          dataSource={ this.dataSourceExploreWays.cloneWithRows(this.state.exploreWays) }
          renderRow={ this.renderExploreWaysRow.bind(this) }
          contentContainerStyle={ styles.listViewExploreWays }
        />

        {this.state.community.showCategoriesInSearch !== false && <Text style={ styles.textTitle }>Browse by Category</Text>}

        {this.state.community.showCategoriesInSearch !== false && <ListView
          pageSize = { this.state.categories.length }
          enableEmptySections={ true }
          dataSource={ this.dataSourceCategories.cloneWithRows(this.state.categories) }
          renderRow={ this.renderCategoriesRow.bind(this) }
          contentContainerStyle={ styles.listViewCategories }
        />}
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
)(MainSearch);

const styles = StyleSheet.create({
  container: {
    flex : 1,
  },
  textTitle: {
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    color: commonColors.grayMoreText,
    paddingTop: 24,
    paddingBottom: 8,
    paddingLeft: screenWidth * 0.05,
  },
  listViewCategories: {
    flexDirection:'row',
    flexWrap: 'wrap',
  },
  listViewExploreWays: {
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
  },
  categoryCellWrap: {
    padding: 10,
    width: categoryCellSize,
    height: categoryCellSize * 1.2,
  },
  categoryCellButtonWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  categoryCellImage: {
    // width: categoryCellSize - 40,
    // height : categoryCellSize - 40,
    width: 60,
    height: 60,
  },
  cagegoryCellText: {
    width: categoryCellSize,
    height : categoryCellSize - 40,
    textAlign: 'center',
    color: commonColors.grayMoreText,
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 12,
    paddingTop: 8,
  },
});

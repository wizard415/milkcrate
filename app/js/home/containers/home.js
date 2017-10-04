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
  Linking,
  TouchableOpacity,
  TouchableHighlight,
  RefreshControl,
  Alert,
  WebView
} from 'react-native';

import { bindActionCreators } from 'redux';
import * as homeActions from '../actions';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux'
import * as commonActions from '../../common/actions';
import * as commonActionTypes from '../../common/actionTypes';

import Carousel from 'react-native-snap-carousel';
import timer from 'react-native-timer';

import NavSearchBar from '../../components/navSearchBar';

import ChallengeCarousel from '../components/challengeCarousel';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import DailyPollStateCell from '../components/dailyPollStateCell';
import Point from '../../components/Point';
import FadeInView from '../components/fadeInView';
import FadeOutView from '../components/fadeOutView';
import EventsListCell from '../../search/components/eventsListCell';

import bendService from '../../bend/bendService'
import * as _ from 'underscore'
import UtilService from '../../components/util'
import Cache from '../../components/Cache'

import * as commonStyles from '../../styles/commonStyles';
import * as commonColors from '../../styles/commonColors';

const carouselLeftMargin = (commonStyles.carouselerWidth - commonStyles.carouselItemWidth) / 2 - commonStyles.carouselItemHorizontalPadding;

const pinIcon = require('../../../assets/imgs/pin-home.png');

class Home extends Component {
  constructor(props) {
    super(props);

    this.dataSource = new ListView.DataSource(
        { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.dataSourceRecentActivity = new ListView.DataSource(
      { rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      isRefreshing: true,

      selectedDailyPollValue: '',
      selectedDailyPollIndex: -1,
      selectedDailyPollStateMode: false,

      challenges: [],
      community: {},
      categories: [],
      pollQuestion:{
        question: {},
        answers: [],
        myAnswer: null,
      },

      hasNewAlert: false,
      alerts: [],
      lastAlertTime: 0,
      recentPines:[]
    };

  }

  componentDidMount() {
    this.hasMounted = true
    this.loadAllData();
    this.loadAlerts();
  }

  componentWillUnmount() {
    this.hasMounted = false
  }

  componentWillReceiveProps(newProps) {
    
    if (newProps.commonStatus === commonActionTypes.RECENT_PINNED_ACTIVITIES) {
      this.setState({ recentPines: newProps.recentPines });
    }

      if(!this.state.pollQuestion.question._id || this.state.pollQuestion.myAnswer)
        this.loadPollQuestion()
  }

  
  loadAllData() {
    this.hasMounted&&this.setState({
      selectedDailyPollValue: '',
      selectedDailyPollIndex: -1,
      selectedDailyPollStateMode: false,

      challenges: [],
      community: {},
      categories: [],
      recentPines:[],
      pollQuestion:{
        question: {},
        answers: [],
        myAnswer: null,
      },
    });

    this.props.commonActions.updateRecentPinnedActivities();

    bendService.getCategories( (error, result) => {

      if (!error) {
        this.hasMounted&&this.setState({
          categories: result
        })
      }
    })

    bendService.getUser((error, result) => {} )

    bendService.getWeeklyChallenges( "", (error, result) => {
      if (error) {
        console.log(error);
        return;
      }

      this.hasMounted&&this.setState({ challenges: result });

      Cache.setMapData('challenges', result)
    })

    bendService.getCommunity( (error, result) => {

      if (error) {
        console.log(error);
        return;
      }

      this.hasMounted&&this.setState({
        community: result
      })
    })

    this.loadPollQuestion()

    /*var currentDate = new Date().setHours(0,0,0,0);
    setInterval(()=>{
      var current = new Date().setHours(0,0,0,0)
      if(current != currentDate) {
        currentDate = current;

        //update poll question
        this.loadPollQuestion();
      }
    }, 1000 * 60 * 10);*/
  }

  // getRecentPinnedActivities() {
  //   bendService.getRecentPinnedActivities((error, result)=>{
  //     if (!error) {
  //       if (this.hasMounted) {
  //         this.setState({
  //           recentPines: result,
  //         });
  //       }
  //     }
  //   })
  // }

  onViewAllPinnedActivities() {
    Actions.PinListView()
  }

  loadAlerts() {
    //first load alerts
    bendService.getUserAlerts( (error, result)=>{
      if (error) {
        console.log(error);
        return;
      }

      if (result.length > 0) {
        this.hasMounted && this.setState({
          alerts: result,
          lastAlertTime:result[0]._bmd.createdAt
        })
      }
    })

    var intervalHandler = setInterval(()=>{
      if(!this.hasMounted) {
        clearInterval(intervalHandler);
        return;
      }
      if (bendService.getActiveUser()) {
        bendService.getLastAlerts(this.state.lastAlertTime, (error, result) => {
          if (error) {
            console.log(error);
            return;
          }

          if (result.length > 0) {
            this.state.alerts = result.concat(this.state.alerts)
            this.hasMounted && this.setState({
              alerts: this.state.alerts,
              lastAlertTime: result[0]._bmd.createdAt,
              hasNewAlert:true
            })
          }
        })
      }
    }, 3000)
  }


  loadPollQuestion() {
    console.log("loadPollQuestion")

    bendService.getPollQuestion( (error, question, answers, myAnswer) => {

      if (this.hasMounted) {
        this.setState({ isRefreshing: false });
      }

      if (error) {
        console.log('poll questions erroror', error);
          this.setState({
              selectedDailyPollValue: '',
              selectedDailyPollIndex: -1,
              selectedDailyPollStateMode: false,
              pollQuestion:{
                  question: {},
                  answers: [],
                  myAnswer: null,
              },
          });
        return;
      }

      if (this.hasMounted) {
        this.setState({
          pollQuestion: {
            question: question,
            answers: answers,
            myAnswer: myAnswer
          }
        });
      }
    });
  }


  onLearnMore() {
    Actions.LearnMoreModal({question:this.state.pollQuestion.question});
  }

  getChallengeCarousel (entries) {

    return entries.map( (entry, index) => {
      const category = bendService.getActivityCategory(this.state.categories, entry.activity)
      if (category == null) {
        return null;
      }
      return (
        <ChallengeCarousel
          key={ index }
          title={ entry.title }
          subtitle={entry.activity.name}
          icon={ UtilService.getCategoryIcon(category) }
          points={ entry.activity.points ? Math.max(Number(entry.activity.points), 1) : 1 }
          link={ entry.activity.url }
          rawData={ entry }
        />
      );
    });
  }

  get showChallenges () {
    if (this.state.challenges.length == 0)
      return null;

    return (
      <Carousel
        sliderWidth={ commonStyles.carouselerWidth }
        itemWidth={ commonStyles.carouselItemWidth }
        inactiveSlideScale={ 1 }
        inactiveSlideOpacity={ 1 }
        enableMomentum={ false }
        containerCustomStyle={ styles.slider }
        contentContainerCustomStyle={ styles.sliderContainer }
        showsHorizontalScrollIndicator={ false }
        snapOnAndroid={ true }
        removeClippedSubviews={ false }
        onSnapToItem={(idx)=>{
          UtilService.mixpanelEvent("Swiped Challenges")
        }}
      >
        { this.getChallengeCarousel( this.state.challenges ) }
      </Carousel>
    );
  }

  onPlayIntroVideo() {
    UtilService.mixpanelEvent("Played Intro Video")
    Actions.VideoPlayModal();
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

  renderPinesListRow(rowData, sectionID, rowID) {
    const caetgoriIcon = UtilService.getCategoryIconFromSlug(rowData.activity);
    return (
      <EventsListCell
        title={ rowData.activity.name }
        icon={ caetgoriIcon }
        points={ Math.max(rowData.activity.points || 1, 1) }
        onClick={ () => this.onRecentActivityCellPressed(rowData) }
      />
    );
  }

  get showRecentPines() {
    if (this.state.recentPines.length == 0) {
      return null;
    }

    return (
      <View>
        <View style={ styles.sectionHeaderContainer }>
          <Text style={ styles.textSectionTitle }>My Pinned Activities</Text>
          <Image style={ styles.imagePin } resizeMode='contain' source={pinIcon} />
        </View>
        <ListView
          enableEmptySections={ true }
          dataSource={ this.dataSource.cloneWithRows(this.state.recentPines) }
          renderRow={ this.renderPinesListRow.bind(this) }
          contentContainerStyle={ styles.listViewWrapper }
        />
        <TouchableHighlight onPress={ () => this.onViewAllPinnedActivities() }>
          <View style={ styles.pinCellContainer }>
            <Text style={ styles.pinTextTitle }>View all...</Text>
          </View>
        </TouchableHighlight>
      </View>      
    );
  }

  get showVideo() {
    var delta = (Date.now() - (bendService.getActiveUser()._bmd.createdAt/1000000))/1000;

    if (delta > 5 * 3600 * 24) {
      return null;
    }

    return (
      <View style={ styles.videoContainer }>
        <View style={ styles.videoTitleContainer }>
          <Text style={ styles.textTitle }>Intro Video</Text>
        </View>
        <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onPlayIntroVideo() }>
          <View style={ styles.imageVideoView }>
            <Image style={ styles.imageVideo } resizeMode='contain' source={require('../../../assets/imgs/vid.png')} />
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  get showMainDailyPollSelectMode() {
    return (
      this.state.selectedDailyPollIndex == -1 ?
        this.showDailyPollSelectMode
        :
        <FadeOutView>
          { this.showDailyPollSelectMode }
        </FadeOutView>
    );
  }

  get showDailyPollSelectMode() {
    return (
      <View style={ styles.dailyPollSelectContentContainer }>
        <RadioForm
          formHorizontal={ false }
          animation={ true }
          style={ styles.radioFormWrapper }
        >
          {
            this.state.pollQuestion.answers.map( (obj, index) => {
              var onPressRadioButton = (value, index) => {
                //console.log(value, index)
                this.hasMounted&&this.setState({
                  selectedDailyPollValue: value,
                  selectedDailyPollIndex: index
                });

                //do polling
                bendService.pollResponse(this.state.pollQuestion.question, this.state.pollQuestion.answers[index], (error, result)=>{
                  if (error) {
                    console.log(error);
                    return
                  }

                  UtilService.mixpanelEvent("Answered Daily Poll Question")

                  //update values locally
                  var communityId = bendService.getActiveUser().community._id
                  this.state.pollQuestion.question.responseCounts = this.state.pollQuestion.question.responseCounts||{}
                  this.state.pollQuestion.question.responseCounts[communityId] = this.state.pollQuestion.question.responseCounts[communityId]||0
                  this.state.pollQuestion.question.responseCounts[communityId]++;
                  this.state.pollQuestion.answers[index].counts = this.state.pollQuestion.answers[index].counts||{}
                  this.state.pollQuestion.answers[index].counts[communityId] = this.state.pollQuestion.answers[index].counts[communityId]||0
                  this.state.pollQuestion.answers[index].counts[communityId] ++

                  this.state.pollQuestion.answers[index].percentages = this.state.pollQuestion.answers[index].percentages||{}
                  this.state.pollQuestion.answers[index].percentages[communityId] = Math.round(this.state.pollQuestion.answers[index].counts[communityId] * 100 / this.state.pollQuestion.question.responseCounts[communityId]);

                  _.map(this.state.pollQuestion.answers, (obj)=>{
                    obj.percentages = obj.percentages||{}
                    obj.counts = obj.counts||{}
                    obj.percentages[communityId] = Math.round((obj.counts[communityId]||0) * 100 / this.state.pollQuestion.question.responseCounts[communityId]);
                  })

                  this.hasMounted&&this.setState({
                    pullQuestion:this.state.pollQuestion
                  })
                })

                timer.setTimeout( this, 'DailyPollTimer', () => {
                  timer.clearTimeout(this, 'DailyPollTimer');
                  this.state.pollQuestion.myAnswer = this.state.pollQuestion.answers[index]
                  this.hasMounted&&this.setState({ selectedDailyPollStateMode: true, myAnswer: this.state.pollQuestion.myAnswer});
                }, 500);
              }

              return (
                <RadioButton
                  labelHorizontal={ true }
                  key={ index }
                  style={ (this.state.pollQuestion.answers.length - 1) == index ? styles.radioButtonWrapper : [styles.radioButtonWrapper, styles.radioButtonBorder] }
                >
                  <RadioButtonInput
                    obj={{
                      label:obj.title,
                      value:obj.position
                    }}
                    index={ index }
                    isSelected={ this.state.selectedDailyPollIndex === index }
                    onPress={ onPressRadioButton }
                    borderWidth={ 1 }
                    buttonInnerColor={ commonColors.theme }
                    buttonOuterColor={ this.state.selectedDailyPollIndex === index ? commonColors.theme : commonColors.grayMoreText }
                    buttonSize={ 16 }
                    buttonOuterSize={ 16 }
                    buttonStyle={{ }}
                    buttonWrapStyle={ styles.radioButtonInputWrapper }
                  />
                  <RadioButtonLabel
                    obj={{
                      label:obj.title,
                      value:obj.position
                    }}
                    index={ index }
                    labelHorizontal={ true }
                    onPress={ onPressRadioButton }
                    labelStyle={ styles.textRadioButtonLabel }
                    labelWrapStyle={ styles.radioButtonLabelWrapper }
                  />
                </RadioButton>
              )
            }
          )}
        </RadioForm>
      </View>
    );
  }

  get showDailyPollStateMode() {
    return (
      <FadeInView>
        <View style={ styles.dailyPollSelectContentContainer }>
          {
            this.state.pollQuestion.answers.map( (obj, index) => {
              var communityId = bendService.getActiveUser().community._id;
              var percent = obj.percentages?Number(obj.percentages[communityId]||0):0
              return (
                <DailyPollStateCell
                  key={ index }
                  percent={ percent }
                  description={ obj.title }
                  selected={ this.state.selectedDailyPollIndex === index ? true : false }
                  bottomLine={ (this.state.pollQuestion.answers.length - 1) === index ? false : true }
                />
              );
            })
          }
        </View>
      </FadeInView>
    );
  }

  get showDailyPoll() {
    if ((this.state.pollQuestion.question.length === 0 ) || (this.state.pollQuestion.answers.length === 0 )) {
      return null;
    }

    return (
      <View style={ styles.dailyPollContainer }>
        <Text style={ styles.textTitle }>Poll</Text>
        <View style={ styles.dailyPollMainContentContainer }>
          <View style={ styles.dailyPollTopContentContainer }>
            <View style={ styles.dailyPollTopPointContainer }>
              <View style={ styles.dailyPollLearnMoreContainer }>
                <Text style={ styles.textQuestion }>{this.state.pollQuestion.question.question}</Text>
                <View style={ styles.buttonWrapper }>
                  <TouchableOpacity activeOpacity={ .5 } onPress={ () => this.onLearnMore() }>
                    <Text style={ styles.textReadMoreButton }>Learn More</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Point point={ 10 }/>
            </View>
          </View>

          {
            !this.state.pollQuestion.myAnswer ? this.showMainDailyPollSelectMode : this.showDailyPollStateMode
          }

        </View>
      </View>
    );
  }


  onNotifications() {
    if (this.hasMounted) {
      this.setState({ hasNewAlert: false });
    }

    Actions.Notifications({ alerts: this.state.alerts });
  }

  onGoSearchScreen() {
    this.props.onSearch();
  }

  onRefresh() {
    if (this.hasMounted) {
      this.setState({ isRefreshing: true });
    }

    this.loadAllData();
  }

  render() {
    return (
      <View style={ styles.container }>
        <NavSearchBar
          buttons={ commonStyles.NavNotificationButton }
          isNewNotification={ this.state.hasNewAlert }
          onNotifications={ () => this.onNotifications() }
          onGoSearchScreen={ () => this.onGoSearchScreen() }
          searchMode={ false }
        />
        <ScrollView
          style={ styles.scrollView }
          showsVerticalScrollIndicator={ false }
          refreshControl={
            <RefreshControl
              refreshing={ this.state.isRefreshing }
              onRefresh={ () => this.onRefresh() }
              tintColor={ commonColors.theme }
            />
          }
        >
          { this.showRecentPines }
          { this.showChallenges }
          {this.showVideo}
          { this.showDailyPoll }
        </ScrollView>
      </View>
    );
  }
}

export default connect(props => ({
    status: props.home.status,
    commonStatus: props.common.status,
    recentPines: props.common.recentPinnedActivities,

  }),
  (dispatch) => ({
    actions: bindActionCreators(homeActions, dispatch),
    commonActions: bindActionCreators(commonActions, dispatch),
  })
) (Home);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f4fafd',
  },
  slider: {

  },
  sliderContainer: {
    marginLeft: -carouselLeftMargin,
  },
  textTitle: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    padding: 10,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  videoTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },  
  dailyPollContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  dailyPollMainContentContainer: {
    flex: 1,
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: commonColors.line,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
  },
  dailyPollTopContentContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    paddingVertical: 10,
    paddingLeft: 25,
    paddingRight: 10,
  },
  dailyPollTopPointContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyPollLearnMoreContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  textQuestion: {
    color: commonColors.question,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  buttonWrapper: {
    flex: 1,
    paddingTop: 8,
  },
  textReadMoreButton: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  textRadioButtonLabel: {
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
    textAlign: 'left',
    backgroundColor: 'transparent',
  },
  radioButtonLabelWrapper: {
    flex: 1,
    marginLeft: 5,
    marginRight: 10,
    paddingVertical: 10,
  },
  radioButtonInputWrapper: {
    paddingVertical: 10,
    marginLeft: 20,
  },
  radioButtonWrapper: {
    flex: 1,
  },
  radioButtonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
  },
  radioFormWrapper: {
    flex: 1,
  },
  dailyPollSelectContentContainer: {

  },    
  imageVideo: {
    flexShrink: 1,
    height: 200,
    backgroundColor:'black',
  },
  imageVideoView: {
    flexDirection:'row',
    alignItems:'center',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    paddingTop:10
  },
  textSectionTitle: {
    color: commonColors.grayMoreText,
    fontFamily: 'OpenSans-Semibold',
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 8,
  },
  pinCellContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: commonColors.line,
    borderStyle: 'solid',
    alignItems: 'center',
  },
  pinTextTitle: {
    flex: 1,
    color: commonColors.title,
    fontFamily: 'Open Sans',
    fontSize: 14,
  },
  imagePin: {
    width: 9,
    height: 13,
    marginLeft: 5,
    marginTop: 5
  },
});

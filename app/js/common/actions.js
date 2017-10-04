import * as types from './actionTypes';
import bendService from '../bend/bendService'

export function likeRecentActivity(activity, like) {
  return dispatch => {
    bendService.likeActivity(activity, like, (error, result) => {
      
      if (error) {        
        console.log(error);
        dispatch({ type: types.RECENT_ACTIVITY_LIKE_ERROR });
      } 
      else {
        dispatch({ type: types.RECENT_ACTIVITY_LIKE_SUCCESS, result: result, recentActivityId: activity._id, recentActivityLike: like });
      }
    })
  }  
}

export function captureActivity(activityId) {
  //console.log("captureActivity", activityId, flag)
  return dispatch => {
    dispatch({ type: types.ACTIVITY_CAPTURE_SUCCESS, activityId: activityId});
  }
}

export function removeActivity(activityId) {
  //console.log("captureActivity", activityId, flag)
  return dispatch => {
    dispatch({ type: types.ACTIVITY_REMOVE_SUCCESS, activityId: activityId});
  }
}

export function updateRecentPinnedActivities() {
  return dispatch => {
    bendService.getRecentPinnedActivities( (error, result) => {
      if (!error) {
        dispatch({ type: types.RECENT_PINNED_ACTIVITIES, recentPinnedActivities: result });
      }
    });
  }
}


export function updateAllPinnedActivities() {
  return dispatch => {
    bendService.getAllPinnedActivities((error, result) => {
      if (!error) {
        dispatch({ type: types.ALL_PINNED_ACTIVITIES, allPinnedActivities: result });
      }
    });
  }
}


export function getCurrentUserProfile() {

  return dispatch => {
    bendService.getUser( (error, result) => {
      if (!error) {
        dispatch({ type: types.CURRENT_USER_PROFILE, currentUser: result });
      }
    });
  }
}
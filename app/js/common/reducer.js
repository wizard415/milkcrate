import * as types from './actionTypes';

const initialState = {
  status: null,
};

export default function common(state = initialState, action = {}) {
  //console.log("common reducer", action)
  switch (action.type) {
    case types.RECENT_ACTIVITY_LIKE_SUCCESS:
      return {
        ...state,
        status: types.RECENT_ACTIVITY_LIKE_SUCCESS,
        likeResult: action.result,
        recentActivityId: action.recentActivityId,
        recentActivityLike: action.recentActivityLike,
      };
    case types.RECENT_ACTIVITY_LIKE_ERROR:
      return {
        ...state,
        status: types.RECENT_ACTIVITY_LIKE_ERROR,
      };
    case types.ACTIVITY_CAPTURE_SUCCESS:
      return {
        ...state,
        status: types.ACTIVITY_CAPTURE_SUCCESS,
        activityId: action.activityId,
      };
    case types.ACTIVITY_REMOVE_SUCCESS:
      return {
        ...state,
        status: types.ACTIVITY_REMOVE_SUCCESS,
        activityId: action.activityId,
      };
    case types.RECENT_PINNED_ACTIVITIES:
      return {
        ...state,
        status: types.RECENT_PINNED_ACTIVITIES,
        recentPinnedActivities: action.recentPinnedActivities,
      };
    case types.ALL_PINNED_ACTIVITIES:
      return {
        ...state,
        status: types.ALL_PINNED_ACTIVITIES,
        allPinnedActivities: action.allPinnedActivities,
      };
  
    case types.CURRENT_USER_PROFILE:

      return {
        ...state,
        status: types.CURRENT_USER_PROFILE,
        currentUser: action.currentUser,
      };

    default:
      return state;
  }
}

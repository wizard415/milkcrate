import * as types from './actionTypes';

const initialState = {
  status: null,
};

export default function setupProfile(state = initialState, action = {}) {

  switch (action.type) {
    case types.SETUP_PROFILE_REQUEST:
      return {
        ...state,
        status: 'setup_profile_request',
      };
    case types.SETUP_PROFILE_SUCCESS:
      return {
        ...state,
        status: 'setup_profile_success',
      };
    case types.SETUP_PROFILE_ERROR:
      return {
        ...state,
        status: 'setup_profile_error',
      };
    case types.PROFILE_REQUEST:
      return {
        ...state,
        status: 'profile_request',
      };
    case types.PROFILE_SUCCESS:
      return {
        ...state,
        status: 'profile_success',
      };
    case types.PROFILE_ERROR:
      return {
        ...state,
        status: 'profile_error',
      };
    case types.COMMUNITY_POINTS_REQUEST:
      return {
        ...state,
        status: 'community_points_request',
      };
    case types.COMMUNITY_POINTS_SUCCESS:
      return {
        ...state,
        status: 'community_points_success',
      };
    case types.COMMUNITY_POINTS_ERROR:
      return {
        ...state,
        status: 'community_points_error',
      };
    default:
      return state;
  }
}

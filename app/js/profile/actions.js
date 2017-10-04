import * as types from './actionTypes';

export function setupProfile() {
  return {
    type: [types.SETUP_PROFILE_REQUEST, types.SETUP_PROFILE_SUCCESS, types.SETUP_PROFILE_ERROR]
  };
}

export function profile() {
  return {
    type: [types.PROFILE_REQUEST, types.PROFILE_SUCCESS, types.PROFILE_ERROR]
  };
}

export function communityPoints() {
  return {
    type: [types.COMMUNITY_POINTS_REQUEST, types.COMMUNITY_POINTS_SUCCESS, types.COMMUNITY_POINTS_ERROR]
  };
}

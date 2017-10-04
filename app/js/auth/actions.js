import * as types from './actionTypes';

export function signup(email, password, communityCode) {
  return {
    type: [types.SIGNUP_REQUEST, types.SIGNUP_SUCCESS, types.SIGNUP_ERROR]
  };
}


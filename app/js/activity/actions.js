import * as types from './actionTypes';

export function activity() {
  return {
    type: [types.ACTIVITY_REQUEST, types.ACTIVITY_SUCCESS, types.ACTIVITY_ERROR]
  };
}


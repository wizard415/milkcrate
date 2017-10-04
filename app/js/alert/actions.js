import * as types from './actionTypes';

export function alert() {
  return {
    type: [types.ALERT_REQUEST, types.ALERT_SUCCESS, types.ALERT_ERROR]
  };
}


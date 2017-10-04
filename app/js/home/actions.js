import * as types from './actionTypes';

export function home() {
  return {
    type: [types.HOME_REQUEST, types.HOME_SUCCESS, types.HOME_ERRORE]
  };
}
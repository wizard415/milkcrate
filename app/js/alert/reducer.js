import * as types from './actionTypes';

const initialState = {
  status: null,
};

export default function alert(state = initialState, action = {}) {

  switch (action.type) {
    case types.ALERT_REQUEST:
      return {
        ...state,
        status: 'alert_request',
      };
    case types.ALERT_SUCCESS:
      return {
        ...state,
        status: 'alert_success',
      };
    case types.ALERT_ERROR:
      return {
        ...state,
        status: 'alert_error',
      };
    default:
      return state;
  }
}

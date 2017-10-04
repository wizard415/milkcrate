import * as types from './actionTypes';

const initialState = {
  status: null,
};

export default function activity(state = initialState, action = {}) {

  switch (action.type) {
    case types.ACTIVITY_REQUEST:
      return {
        ...state,
        status: 'activity_request',
      };
    case types.ACTIVITY_SUCCESS:
      return {
        ...state,
        status: 'activity_success',
      };
    case types.ACTIVITY_ERROR:
      return {
        ...state,
        status: 'activity_error',
      };
    default:
      return state;
  }
}

import * as types from './actionTypes';

const initialState = {
  status: null,
};

export default function home(state = initialState, action = {}) {

  switch (action.type) {
    case types.HOME_REQUEST:
      return {
        ...state,
        status: 'home_request',
      };
    case types.HOME_SUCCESS:
      return {
        ...state,
        status: 'home_success',
      };
    case types.HOME_ERROR:
      return {
        ...state,
        status: 'home_error',
      };
    default:
      return state;
  }
}

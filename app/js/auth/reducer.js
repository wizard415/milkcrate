import * as types from './actionTypes';

const initialState = {
  status: null,
};

export default function auth(state = initialState, action = {}) {

  switch (action.type) {
    case types.SIGNUP_REQUEST:
      return {
        ...state,
        status: 'signup_request',
      };
    case types.SIGNUP_SUCCESS:
      return {
        ...state,
        status: 'signup_success',
      };
    case types.SIGNUP_ERROR:
      return {
        ...state,
        status: 'signup_error',
      };
    case types.LOGIN_REQUEST:
      return {
        ...state,
        status: 'login_request',
      };
    case types.LOGIN_SUCCESS:
      return {
        ...state,
        status: 'login_success',
      };
    case types.LOGIN_ERROR:
      return {
        ...state,
        status: 'login_error',
      };
    default:
      return state;
  }
}
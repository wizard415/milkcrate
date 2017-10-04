import * as types from './actionTypes';

const initialState = {
  status: null,
};

export default function search(state = initialState, action = {}) {

  switch (action.type) {
    case types.SEARCH_CATEGORY_REQUEST:
      return {
        ...state,
        status: 'search_category_request',
      };
    case types.SEARCH_CATEGORY_SUCCESS:
      return {
        ...state,
        status: 'search_category_success',
      };
    case types.SEARCH_CATEGORY_ERROR:
      return {
        ...state,
        status: 'search_category_error',
      };
    default:
      return state;
  }
}

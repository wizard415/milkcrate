import * as types from './actionTypes';

export function selectCategory() {
  return {
    type: [types.SEARCH_CATEGORY_REQUEST, types.SEARCH_CATEGORY_SUCCESS, types.SEARCH_CATEGORY_ERROR]
  };
}


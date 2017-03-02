import { combineReducers } from 'redux';
import selection from './selection';

export const reducers = {
  selection
};

export default combineReducers(Object.assign({}, reducers));

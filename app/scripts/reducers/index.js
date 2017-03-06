import { combineReducers } from 'redux';
import selection from './selection';
import map from './map';

export const reducers = {
  selection,
  map
};

export default combineReducers(Object.assign({}, reducers));

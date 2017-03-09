import { combineReducers } from 'redux';
import selection from './selection';
import map from './map';
import draw from './draw';

export const reducers = {
  selection,
  map,
  draw
};

export default combineReducers(Object.assign({}, reducers));

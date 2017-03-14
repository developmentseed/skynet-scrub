import { combineReducers } from 'redux';
import selection from './selection';
import map from './map';
import draw from './draw';
import save from './save';

export const reducers = {
  selection,
  map,
  draw,
  save
};

export default combineReducers(Object.assign({}, reducers));

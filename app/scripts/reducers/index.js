import { combineReducers } from 'redux';
import changed from './changed';

export const reducers = {
  changed
};

export default combineReducers(Object.assign({}, reducers));

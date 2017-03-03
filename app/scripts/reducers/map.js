import { COMPLETE_MAP_UPDATE, UPDATE_MAP_DATA } from '../actions';

const MAP_STATUS = {
  CLEAN: 'clean',
  DIRTY: 'dirty'
};

const initial = {
  store: new Map(),
  status: MAP_STATUS.CLEAN
};

const map = (state = initial, action) => {
  switch (action.type) {
    case COMPLETE_MAP_UPDATE:
      return { store: state.store, status: MAP_STATUS.CLEAN };
    case UPDATE_MAP_DATA:
      return { store: action.data, status: MAP_STATUS.DIRTY };
    default:
      return state;
  }
};

export default map;

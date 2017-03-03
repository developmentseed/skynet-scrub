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
      const newStore = new Map(state.store);
      // for all of the new data, add it to the store only if it wasn't there
      // before; don't overwrite
      console.log(action.data);
      action.data.forEach(f => {
        if (!newStore.has(f.id)) {
          newStore.set(f.id, f.object);
        }
      });
      return { store: newStore, status: MAP_STATUS.DIRTY };
    default:
      return state;
  }
};

export default map;

import { COMPLETE_MAP_UPDATE, UPDATE_MAP_DATA, REQUEST_TILE } from '../actions';

const initial = {
  tempStore: null,
  requestedTiles: new Set()
};

const map = (state = initial, action) => {
  switch (action.type) {
    case COMPLETE_MAP_UPDATE:
      return { tempStore: null, requestedTiles: state.requestedTiles };
    case UPDATE_MAP_DATA:
      return { tempStore: action.data, requestedTiles: state.requestedTiles };
    case REQUEST_TILE:
      return {
        tempStore: state.tempStore,
        requestedTiles: new Set(state.requestedTiles).add(action.data, true)
      };
    default:
      return state;
  }
};

export default map;

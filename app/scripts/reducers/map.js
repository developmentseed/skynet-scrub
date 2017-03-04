import { COMPLETE_MAP_UPDATE, UPDATE_MAP_DATA } from '../actions';

const initial = {
  tempStore: null
};

const map = (state = initial, action) => {
  switch (action.type) {
    case COMPLETE_MAP_UPDATE:
      return { tempStore: null };
    case UPDATE_MAP_DATA:
      return { tempStore: action.data };
    default:
      return state;
  }
};

export default map;

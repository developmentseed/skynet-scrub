import { SAVE, LOCAL_STORAGE } from '../actions';

const initial = {
  inflight: false,
  error: null,
  success: null,
  historyId: null,
  cached: null
};

const save = (state = initial, action) => {
  switch (action.type) {
    case SAVE:
      return Object.assign({}, state, action.data);
    case LOCAL_STORAGE:
      return Object.assign({}, state, { cached: action.data });
    default:
      return state;
  }
};

export default save;

import { SAVE } from '../actions';

const initial = {
  inflight: false,
  error: null,
  success: null,
  historyId: null
};

const save = (state = initial, action) => {
  switch (action.type) {
    case SAVE:
      return Object.assign({}, state, action.data);
    default:
      return state;
  }
};

export default save;

import { CHANGE_DRAW_MODE, TOGGLE_VISIBILITY } from '../actions';

const initial = {
  mode: null,
  hidden: {}
};

const draw = (state = initial, action) => {
  switch (action.type) {
    case CHANGE_DRAW_MODE:
      return { mode: action.data };
    case TOGGLE_VISIBILITY:
      const status = action.data
      if (state.hidden[status]) {
        delete state.hidden[status]
      } else {
        state.hidden[status] = true
      }
      return Object.assign({}, state);
    default:
      return state;
  }
};

export default draw;

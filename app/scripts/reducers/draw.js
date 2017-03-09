import { CHANGE_DRAW_MODE } from '../actions';

const initial = {
  mode: null
};

const draw = (state = initial, action) => {
  switch (action.type) {
    case CHANGE_DRAW_MODE:
      return { mode: action.data };
    default:
      return state;
  }
};

export default draw;

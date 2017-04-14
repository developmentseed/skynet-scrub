import { CHANGE_DRAW_MODE, TOGGLE_VISIBILITY } from '../actions';
import { COMPLETE, INCOMPLETE, EDITED } from '../components/map/utils/constants';

const initial = {
  mode: null,
  hidden: []
};

const draw = (state = initial, action) => {
  switch (action.type) {
    case CHANGE_DRAW_MODE:
      return Object.assign({}, state, { mode: action.data });
    case TOGGLE_VISIBILITY:
      const status = action.data;

      if (status === 'all') {
        state.hidden = state.hidden.length ? [] : [COMPLETE, INCOMPLETE, EDITED];
        return Object.assign({}, state);
      } else if (state.hidden.indexOf(status) > -1) {
        state.hidden.splice(state.hidden.indexOf(status), 1);
      } else {
        state.hidden.push(status);
      }
      return Object.assign({}, state);
    default:
      return state;
  }
};

export default draw;

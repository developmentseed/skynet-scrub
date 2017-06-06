import { CHANGE_DRAW_MODE, TOGGLE_VISIBILITY } from '../actions';
import { COMPLETE, INCOMPLETE, EDITED, INACTIVE } from '../components/map/utils/constants';
import { initialZoom, minTileZoom } from '../config/';

const initial = {
  mode: initialZoom < minTileZoom ? INACTIVE : null,
  hidden: initialZoom < minTileZoom ? [COMPLETE, INCOMPLETE, EDITED] : []
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

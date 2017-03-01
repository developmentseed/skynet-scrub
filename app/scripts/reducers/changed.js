import undoable, { includeAction } from 'redux-undo';
import { ADD_CHANGE } from '../actions';

export const initial = [];

const changed = (state = initial, action) => {
  switch (action.type) {
    case ADD_CHANGE:
      return action.data;
    default:
      return state;
  }
};

export default undoable(changed, { filter: includeAction(ADD_CHANGE) });

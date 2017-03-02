import undoable, { includeAction } from 'redux-undo';
import { UPDATE_SELECTION_HISTORY, UPDATE_SELECTION } from '../actions';

export const initial = [];

const selection = (state = initial, action) => {
  switch (action.type) {
    case UPDATE_SELECTION:
      return action.data;
    case UPDATE_SELECTION_HISTORY:
      return [];
    default:
      return state;
  }
};

export default undoable(selection, { filter: includeAction(UPDATE_SELECTION_HISTORY) });

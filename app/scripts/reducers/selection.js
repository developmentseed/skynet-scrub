import hat from 'hat';
import { UNDO, REDO, COMPLETE_UNDO, COMPLETE_REDO, UPDATE_SELECTION } from '../actions';

const initial = {
  past: [],
  present: { historyId: 'initial', selection: [] },
  future: []
};

const rack = hat.rack();

const selection = (state = initial, action) => {
  const { past, present, future } = state;
  switch (action.type) {
    case UNDO:
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: { selection: previous.selection, historyId: 'undo' },
        future
      };
    case REDO:
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past,
        present: { selection: next.selection, historyId: 'redo' },
        future: newFuture
      };
    case UPDATE_SELECTION:
      return {
        past: [ ...past, { historyId: present.historyId, selection: action.data } ],
        present: { historyId: rack(), selection: [] },
        future: []
      };
    case COMPLETE_UNDO:
      return {
        past,
        present: { historyId: rack(), selection: [] },
        future: [ present, ...future ]
      };
    case COMPLETE_REDO:
      return {
        past: [ ...past, present ],
        present: { historyId: rack(), selection: [] },
        future
      };
    default:
      return state;
  }
};

export default selection;

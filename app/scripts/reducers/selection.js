import hat from 'hat';
import { UNDO, REDO, UPDATE_SELECTION } from '../actions';

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
        present: previous,
        future: [ present, ...future ]
      };
    case REDO:
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [ ...past, present ],
        present: next,
        future: newFuture
      };
    case UPDATE_SELECTION:
      return {
        past: [ ...past, { historyId: present.historyId, selection: action.data } ],
        present: { historyId: rack(), selection: [] },
        future
      };
    default:
      return state;
  }
};

export default selection;

'use strict';
import findIndex from 'lodash.findindex';

// compress a series of changes into a single change per id
function compressChanges (selectionArray, lastHistoryId) {
  let index = 0;
  if (typeof lastHistoryId !== 'undefined') {
    index = findIndex(selectionArray, d => d.historyId === lastHistoryId);
    index = index === -1 ? 0 : index + 1;
  }
  const compressed = {};
  for (let i = index; i < selectionArray.length; ++i) {
    const selectionObj = selectionArray[i];
    const { selection } = selectionObj;
    selection.forEach(action => {
      const { id, redo } = action;
      if (!compressed[id]) {
        // if the action is 'new' for this ID, save a copy
        compressed[id] = Object.assign({}, action);
      } else {
        compressed[id].redo = redo;
      }
    });
  }
  return values(compressed);
}

// compress a series of changes from the store into a smaller format
export default function compress (selectionArray, lastHistoryId) {
  const compressed = compressChanges(selectionArray, lastHistoryId);
  const deleted = {};
  const edited = {};
  const created = {};
  compressed.forEach(action => {
    const { id, undo, redo } = action;
    // blank action, was created then deleted
    if (!undo && !redo) return;
    else if (!redo) deleted[id] = 1;
    else if (!undo) created[id] = redo;
    else edited[id] = redo;
  });
  return {
    deleted: Object.keys(deleted),
    edited: values(edited).concat(values(created))
  };
}

function values (obj) {
  return Object.keys(obj).map(key => obj[key]).filter(Boolean);
}

'use strict';
// compress a series of changes from the store into a smaller format
export default function compress (selectionArray) {
  const deleted = {};
  const edited = {};
  const created = {};
  selectionArray.forEach(selectionObj => {
    const { selection } = selectionObj;
    selection.forEach(action => {
      const { id, undo, redo } = action;
      if (!redo) {
        // deletion - but don't save it as a delete it's new.
        if (created[id]) delete created[id];
        else {
          deleted[id] = 1;
          // delete a previous edit if it exists.
          edited[id] && delete edited[id];
        }
      } if (!undo) {
        // creation - save as such.
        created[id] = redo;
      } else {
        // alteration - check if it's just created, and apply the new change there if so.
        if (created[id]) created[id] = redo;
        else edited[id] = redo;
      }
    });
  });
  return {
    deleted: Object.keys(deleted),
    edited: values(edited).concat(values(created))
  };
}

function values (obj) {
  return Object.keys(obj).map(key => obj[key]).filter(Boolean);
}

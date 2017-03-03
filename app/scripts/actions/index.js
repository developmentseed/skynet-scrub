export const UPDATE_SELECTION = 'UPDATE_SELECTION';
export const UNDO = 'UNDO';
export const REDO = 'REDO';
export const COMPLETE_UNDO = 'COMPLETE_UNDO';
export const COMPLETE_REDO = 'COMPLETE_REDO';

/**
 * Updates the selection store with a new array of changes
 * @param {Array<Object>} selectionArray array of objects with the form:
 *  { id, undo, redo } where `undo` and `redo` are GeoJSON features (or `null`)
 *  describing the previous and current state respectively of the feature on the
 *  map (at the time it was changed).
 * @returns {Object} Redux action.
 */
export function updateSelection (selectionArray) {
  return { type: UPDATE_SELECTION, data: selectionArray };
}

export function undo () {
  return { type: UNDO };
}

export function redo () {
  return { type: REDO };
}

export function completeUndo () {
  return { type: COMPLETE_UNDO };
}

export function completeRedo () {
  return { type: COMPLETE_REDO };
}

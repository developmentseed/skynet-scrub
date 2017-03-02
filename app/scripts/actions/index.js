export const UPDATE_SELECTION = 'UPDATE_SELECTION';
export const UNDO = 'UNDO';
export const REDO = 'REDO';
export const COMPLETE_UNDO = 'COMPLETE_UNDO';
export const COMPLETE_REDO = 'COMPLETE_REDO';

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

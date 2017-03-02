export const UPDATE_SELECTION = 'UPDATE_SELECTION';
export const UPDATE_SELECTION_HISTORY = 'UPDATE_SELECTION_HISTORY';

export function updateSelection (selectionArray) {
  return { type: UPDATE_SELECTION, data: selectionArray };
}

export function updateSelectionHistory () {
  return { type: UPDATE_SELECTION_HISTORY };
}

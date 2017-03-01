export const ADD_CHANGE = 'ADD_CHANGE';

export function addChange (changeArray) {
  return { type: ADD_CHANGE, data: changeArray };
}

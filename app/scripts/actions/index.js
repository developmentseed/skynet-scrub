import fetch from 'isomorphic-fetch';
import config from '../config';

export const UPDATE_SELECTION = 'UPDATE_SELECTION';
export const UNDO = 'UNDO';
export const REDO = 'REDO';
export const COMPLETE_UNDO = 'COMPLETE_UNDO';
export const COMPLETE_REDO = 'COMPLETE_REDO';
export const COMPLETE_MAP_UPDATE = 'COMPLETE_MAP_UPDATE';
export const UPDATE_MAP_DATA = 'UPDATE_MAP_DATA';
export const REQUEST_TILE = 'REQUEST_TILE';

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

export function completeMapUpdate () {
  return { type: COMPLETE_MAP_UPDATE };
}

export function updateMapData (data) {
  return { type: UPDATE_MAP_DATA, data };
}

/**
  * Tracks already requested tiles
  * @param {string} tile of the form x/y/z
  * @returns {Object} Redux action.
  */

export function requestTile (tile) {
  return { type: REQUEST_TILE, data: tile };
}

export function fetchMapData (tile) {
  return (dispatch) => {
    dispatch(requestTile(tile.join('/')));
    fetch(`${config.baseUrl}/features/${tile[2]}/${tile[0]}/${tile[1]}.json`)
      .then(response => response.json())
      .then(response => dispatch(updateMapData(response)));
  };
}

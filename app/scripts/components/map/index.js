'use strict';
import React from 'react';
import { connect } from 'react-redux';
import glSupported from 'mapbox-gl-supported';
import c from 'classnames';
import bboxPolygon from 'turf-bbox-polygon';
import { point } from '@turf/helpers';
import lineSlice from '@turf/line-slice';
import { tiles } from 'tile-cover';
import uniq from 'lodash.uniq';
import { firstCoord, lastCoord } from '../../util/line';
import { environment } from '../../config';
import window from '../../util/window';
const { mapboxgl, MapboxDraw, document } = window;

import drawStyles from './styles/mapbox-draw-styles';
import { updateSelection, undo, redo, completeUndo, completeRedo, fetchMapData,
  completeMapUpdate, changeDrawMode } from '../../actions';

const SPLIT = 'split';
const COMPLETE = 'complete';
const INCOMPLETE = 'incomplete';
const EDITED = 'edited';
const MULTIPLE = 'multiple';

const glSupport = glSupported();
const noGl = (
  <div className='nogl'>
    <p>Sorry, but your browser does not support GL.</p>
  </div>
);
const id = 'main-map-component';
const Map = React.createClass({
  getInitialState: () => ({ selected: [] }),

  initMap: function (el) {
    if (el && !this.map && glSupport) {
      mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZWd5cHQiLCJhIjoiY2l6ZTk5YTNxMjV3czMzdGU5ZXNhNzdraSJ9.HPI_4OulrnpD8qI57P12tg';
      this.map = new mapboxgl.Map({
        center: [125.48, 9.7],
        container: el,
        scrollWheelZoom: false,
        style: 'mapbox://styles/mapbox/satellite-v9',
        zoom: 14
      });
      const draw = new MapboxDraw({
        styles: drawStyles,
        displayControlsDefault: false,
        controls: { trash: true, line_string: true },
        userProperties: true
      });
      this.map.addControl(draw);
      this.draw = draw;
      window.Draw = draw;
      this.map.on('draw.create', (e) => this.handleCreate(e.features));
      this.map.on('draw.delete', (e) => this.handleDelete(e.features));
      this.map.on('draw.update', (e) => this.handleUpdate(e.features));
      this.map.on('draw.selectionchange', (e) => {
        // internal state used to track "previous state" of edited geometry
        this.setState({selected: e.features});
      });
      this.map.on('load', (e) => {
        this.loadMapData(e);
      });
      this.map.on('moveend', (e) => {
        this.loadMapData(e);
      });
      this.map.on('click', (e) => {
        switch (this.props.draw.mode) {
          case SPLIT: this.splitLine(e); break;
        }
      });
      // development-only logs for when draw switches modes
      if (environment === 'development') {
        this.map.on('draw.modechange', (e) => {
          console.log('mode', e.mode);
        });
      }
    }
  },

  splitMode: function (options) {
    options = options || {};
    if (this.props.draw.mode === SPLIT) {
      this.props.dispatch(changeDrawMode(null));
      this.draw.changeMode('simple_select', options);
    } else {
      this.props.dispatch(changeDrawMode(SPLIT));
      this.draw.changeMode('static');
    }
  },

  componentWillMount: function () {
    if (typeof document.addEventListener === 'function') {
      document.addEventListener('keydown', this.handleShortcuts);
    }
  },

  componentWillUnmount: function () {
    if (typeof document.removeEventListener === 'function') {
      document.removeEventListener('keydown', this.handleShortcuts);
    }
  },

  componentWillReceiveProps: function (nextProps) {
    // if we have a selection, update our map accordingly
    const { selection, historyId } = nextProps.selection.present;
    if (selection.length) {
      selection.forEach(f => {
        this.featureUpdate(f, historyId);
      });
      this.props.dispatch(historyId === 'undo' ? completeUndo() : completeRedo());
    }

    // if we have a tempStore, update the Draw.store with it then clear
    if (nextProps.map.tempStore) {
      nextProps.map.tempStore.forEach(feature => {
        // only add, no deletes or updates
        if (!this.draw.get(feature.properties.id)) {
          this.draw.add(Object.assign({}, feature, { id: feature.properties.id }));
        }
      });
      this.props.dispatch(completeMapUpdate());
    }
  },

  featureUpdate: function (feature, undoOrRedoKey) {
    // if we have a geo, replace/add
    if (feature[undoOrRedoKey]) {
      this.draw.add(feature[undoOrRedoKey]);
    } else {
      // otherwise delete
      this.draw.delete(feature.id);
    }
  },

  handleShortcuts: function (e) {
    const { past, future } = this.props.selection;
    const { ctrlKey, metaKey, shiftKey, keyCode } = e;
    // meta key can take the place of ctrl on osx
    const ctrl = ctrlKey || metaKey;
    let isShortcut = true;
    switch (keyCode) {
      // z
      case (90):
        if (shiftKey && ctrl && future.length) this.redo();
        else if (ctrl && past.length) this.undo();
        break;
      default:
        isShortcut = false;
    }
    // only prevent default if we hit a real shortcut
    if (isShortcut) { e.preventDefault(); }
  },

  handleDelete: function (features) {
    this.props.dispatch(updateSelection(features.map(createUndo)));
  },

  handleCreate: function (features) {
    features.forEach(this.markAsEdited);
    this.props.dispatch(updateSelection(features.map(createRedo)));
  },

  handleUpdate: function (features) {
    features.forEach(this.markAsEdited);
    this.props.dispatch(updateSelection(features.map(f => {
      const oldFeature = this.state.selected.find(a => a.id === f.id);
      return { id: f.id, undo: oldFeature, redo: f };
    })));
    this.setState({selected: this.draw.getSelected().features});
  },

  undo: function () {
    this.props.dispatch(undo());
  },

  redo: function () {
    this.props.dispatch(redo());
  },

  getCoverTile: function (bounds, zoom) {
    const limits = { min_zoom: zoom, max_zoom: zoom };
    const feature = bboxPolygon(bounds[0].concat(bounds[1]));
    const cover = tiles(feature.geometry, limits);

    // if we have one tile to cover the area, return it, otherwise try at one
    // zoom level up
    return (cover.length === 1)
    ? cover[0]
    : this.getCoverTile(bounds, zoom - 1);
  },

  loadMapData: function (mapEvent) {
    const coverTile = this.getCoverTile(
      mapEvent.target.getBounds().toArray(),
      Math.floor(mapEvent.target.getZoom())
    );
    // only fetch new data if we haven't requested this tile before
    if (!this.props.map.requestedTiles.has(coverTile.join('/'))) {
      this.props.dispatch(fetchMapData(coverTile));
    }
  },

  markAsEdited: function (feature) {
    // only mark line status as edited if it has no prior status
    if (!feature.properties.status) {
      feature.properties.status = EDITED;
      this.draw.add(feature);
    }
  },

  splitLine: function (e) {
    const { draw } = this;
    const ids = draw.getFeatureIdsAt(e.point);
    if (!ids.length) { return; }
    const line = draw.get(ids[0]);
    const cursorAt = point([e.lngLat.lng, e.lngLat.lat]);

    // delete the existing line, and add two additional lines.
    draw.delete(line.id);
    const newIds = [];
    newIds.push(draw.add(lineSlice(point(firstCoord(line)), cursorAt, line)));
    newIds.push(draw.add(lineSlice(cursorAt, point(lastCoord(line)), line)));

    this.splitMode({ featureIds: newIds });
    const newLines = newIds.map(id => draw.get(id));

    // Mark the new lines as edited
    newLines.forEach(this.markAsEdited);
    const actions = newLines.map(createRedo).concat(createUndo(line));
    this.props.dispatch(updateSelection(actions));
  },

  setLineStatus: function (e) {
    const { value } = e.currentTarget;
    if (value === MULTIPLE) return;
    const ids = this.state.selected.map(d => d.id);
    // set the new completion status
    ids.forEach(id => this.draw.setFeatureProperty(id, 'status', value));
    // re-query the features and add to history
    const updatedFeatures = ids.map(id => this.draw.get(id));
    this.handleUpdate(updatedFeatures);
  },

  render: function () {
    if (!glSupport) { return noGl; }
    const { past, future } = this.props.selection;
    const selectedFeatures = this.state.selected;
    const statuses = uniq(selectedFeatures.map(d => d.properties.status || INCOMPLETE));
    const status = !statuses.length ? null
      : statuses.length > 1 ? MULTIPLE : statuses[0];
    return (
      <div className='map__container' ref={this.initMap} id={id}>
        <button className={c({disabled: !past.length})} onClick={this.undo}>Undo</button>
        <button className={c({disabled: !future.length})} onClick={this.redo}>Redo</button>
        <button className={c({active: this.props.draw.mode === SPLIT})} onClick={this.splitMode}>Split</button>
        {selectedFeatures.length ? (
          <select value={status} onChange={this.setLineStatus}>
            {status === MULTIPLE && <option value={MULTIPLE}>Multiple</option>}
            <option value={INCOMPLETE}>Incomplete</option>
            <option value={EDITED}>Edited</option>
            <option value={COMPLETE}>Complete</option>
          </select>
        ) : null}
      </div>
    );
  },

  propTypes: {
    dispatch: React.PropTypes.func,
    selection: React.PropTypes.object,
    map: React.PropTypes.object,
    draw: React.PropTypes.object
  }
});

function createUndo (f) {
  return { id: f.id, undo: f, redo: null };
}

function createRedo (f) {
  return { id: f.id, undo: null, redo: f };
}

function mapStateToProps (state) {
  return {
    selection: state.selection,
    map: state.map,
    draw: state.draw
  };
}

export default connect(mapStateToProps)(Map);

'use strict';
import React from 'react';
import { connect } from 'react-redux';
import c from 'classnames';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import bboxPolygon from 'turf-bbox-polygon';
import { point } from '@turf/helpers';
import lineSlice from '@turf/line-slice';
import { tiles } from 'tile-cover';
import uniq from 'lodash.uniq';
import { firstCoord, lastCoord } from '../../util/line';
import { environment, existingRoadsSource } from '../../config';
import window, { mapboxgl, glSupport } from '../../util/window';
const { document } = window;

import drawStyles from './styles/mapbox-draw-styles';
import {
  updateSelection, undo, redo, completeUndo, completeRedo, save, fetchMapData,
  completeMapUpdate, changeDrawMode, toggleVisibility, toggleExistingRoads
} from '../../actions';

const SPLIT = 'split';
const COMPLETE = 'complete';
const INCOMPLETE = 'incomplete';
const EDITED = 'in progress';
const MULTIPLE = 'multiple';

const noGl = (
  <div className='nogl'>
    <p>Sorry, but your browser does not support GL.</p>
  </div>
);
const id = 'main-map-component';
export const Map = React.createClass({
  getInitialState: () => ({ selected: [] }),

  initMap: function (el) {
    if (el && !this.map && glSupport) {
      mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZWd5cHQiLCJhIjoiY2l6ZTk5YTNxMjV3czMzdGU5ZXNhNzdraSJ9.HPI_4OulrnpD8qI57P12tg';
      this.map = window.map = new mapboxgl.Map({
        center: [125.48, 9.7],
        container: el,
        scrollWheelZoom: false,
        style: 'mapbox://styles/mapbox/satellite-v9',
        zoom: 14
      });
      const draw = new MapboxDraw({
        styles: drawStyles,
        displayControlsDefault: false,
        userProperties: true
      });
      this.map.addControl(draw);
      this.draw = draw;
      window.Draw = draw;
      // TODO: review whether the create and delete listeners fire anywhere now
      // that we're calling some events programatically
      this.map.on('draw.create', (e) => this.handleCreate(e.features));
      this.map.on('draw.delete', (e) => this.handleDelete(e.features));
      this.map.on('draw.update', (e) => this.handleUpdate(e.features));
      this.map.on('draw.selectionchange', (e) => {
        // internal state used to track "previous state" of edited geometry
        this.setState({selected: e.features});
      });

      this.map.on('load', (e) => {
        this.map.addSource('network', {
          type: 'vector',
          tiles: [existingRoadsSource]
        });
        this.map.addLayer({
          id: 'network',
          source: 'network',
          type: 'line',
          paint: {
            'line-color': '#3B9FFF',
            'line-width': 2
          },
          'source-layer': 'network'
        });

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

  expandMode: function (options) {
    const lineString = this.draw.getSelected().features[0];
    const selectedPoint = this.draw.getSelectedPoints().features[0];
    const mode = this.draw.getMode();

    if (mode === 'direct_select' && lineString && selectedPoint) {
      this.draw.changeMode('draw_line_string', { featureId: lineString.id, from: selectedPoint });
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
    window.map = window.Draw = null;
  },

  componentWillReceiveProps: function (nextProps) {
    // if we have a selection, update our map accordingly
    const { selection, historyId } = nextProps.selection.present;
    if (selection.length) {
      selection.forEach(f => {
        this.featureUpdate(f, historyId);
      });
      this.props.dispatch(historyId === 'undo' ? completeUndo() : completeRedo());
      const ids = selection.map(d => d.id);
      // Hack to ensure Draw renders the correct color
      this.draw.changeMode('simple_select', { featureIds: ids });
      this.draw.changeMode('simple_select', { featureIds: [] });
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

    // existing roads visibility
    if (nextProps.map.showExistingRoads) {
      this.map.setLayoutProperty('network', 'visibility', 'none');
    } else {
      this.map.setLayoutProperty('network', 'visibility', 'visible');
    }

    // line visibility
    const hiddenLines = nextProps.draw.hidden;

    this.draw.getAll().features.forEach((feature, i) => {
      const visible = feature.properties.visibility !== 'none';
      const featureStatus = feature.properties.status ? feature.properties.status : 'incomplete';

      if (!hiddenLines.length) {
        if (!visible) this.showLine(feature.id);
      } else if (!visible && hiddenLines.indexOf(featureStatus) === -1) {
        this.showLine(feature.id);
      } else if (visible && hiddenLines.indexOf(featureStatus) > -1) {
        this.hideLine(feature.id);
      }
    });
  },

  hideLine: function (featureId) {
    this.draw.setFeatureProperty(featureId, 'visibility', 'none');
  },

  showLine: function (featureId) {
    this.draw.setFeatureProperty(featureId, 'visibility', null);
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
        else if (!shiftKey && ctrl && past.length) this.undo();
        break;

      // s
      case (83):
        if (ctrl) this.save();
        break;

      // e
      case (69):
        this.expandMode();
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
    console.log('handleCreate', features);
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

  save: function () {
    const { past } = this.props.selection;
    const { historyId } = this.props.save;
    this.props.dispatch(save(past, historyId));
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
    if (!mapEvent.target.getBounds) return;
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
      console.log('feature', feature);
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

  toggleVisibility: function (status) {
    this.props.dispatch(toggleVisibility(status));
  },

  toggleExistingRoads: function () {
    this.props.dispatch(toggleExistingRoads());
  },

  delete: function () {
    // override draw functionality for specific case:
    // line selected, no point selected, in direct_select mode
    const mode = this.draw.getMode();
    const selected = this.draw.getSelected().features;
    const selectedPoints = this.draw.getSelectedPoints().features;
    if (mode === 'direct_select' && selected.length && !selectedPoints.length) {
      this.draw.delete(selected.map(f => f.id));
      this.handleDelete(selected);
      this.setState({ selected: [] });
    } else {
      // use native draw delete, event handlers handle the rest
      this.draw.trash();
    }
  },

  render: function () {
    if (!glSupport) { return noGl; }
    const { save } = this.props;
    const { past, future } = this.props.selection;
    const isSynced = !past.length || save.historyId === past[past.length - 1].historyId;
    const selectedFeatures = this.state.selected;
    const statuses = uniq(selectedFeatures.map(d => d.properties.status || INCOMPLETE));
    const status = !statuses.length ? null
      : statuses.length > 1 ? MULTIPLE : statuses[0];
    const hidden = this.props.draw.hidden;
    const showExistingRoads = this.props.map.showExistingRoads;

    return (
      <div className='map__container' ref={this.initMap} id={id}>
        <div className='menubar'>
          <div className='row'>
            <ul>
              <li className={c({ disabled: !selectedFeatures.length })}>
                <label>Line Status</label>
                <div className={c('select-wrapper')}>
                  <select value={status || ''} onChange={this.setLineStatus}>
                    {!selectedFeatures.length && <option value=''></option>}
                    {status === MULTIPLE && <option value={MULTIPLE}>Multiple</option>}
                    <option value={INCOMPLETE}>Incomplete</option>
                    <option value={EDITED}>In Progress</option>
                    <option value={COMPLETE}>Complete</option>
                  </select>
                </div>
              </li>
              <li>
                <button className={c({disabled: !past.length}, 'button button-undo button--outline')} onClick={this.undo}>Undo</button>
                <button className={c({disabled: !future.length}, 'button button-redo button--outline')} onClick={this.redo}>Redo</button>
              </li>
              <li>
                <button className={c({disabled: isSynced}, 'button button-base')} onClick={this.save}>Save Changes</button>
                {save.inflight ? <span style={{float: 'right'}}>Saving...</span> : null}
                {save.success ? <span style={{float: 'right'}}>Success!</span> : null}
              </li>
            </ul>
          </div>
        </div>
        <div className='tool-bar'>
          <fieldset className='tools'>
            <legend>Tools</legend>
            <ul>
              <li className='tool--line tool__item' onClick={() => this.draw.changeMode('draw_line_string')}>
                <a href="#">
                  <img alt='Add Line' src='../graphics/layout/icon-line.svg' />
                </a>
              </li>
              <li className='tool--line-add tool__item' onClick={this.expandMode}>
                <a href="#">
                  <img alt='Add Point' src='../graphics/layout/icon-addline.svg' />
                </a>
              </li>
              <li className='tool--cut tool__item'>
                <a className={c({active: this.props.draw.mode === SPLIT})} onClick={this.splitMode} href="#">
                  <img alt='Split Line' src='../graphics/layout/icon-cut.svg' />
                </a>
              </li>
              <li className='tool--trash tool__item' onClick={this.delete}>
                <a href="#">
                  <img alt='delete' src='../graphics/layout/icon-trash.svg' />
                </a>
              </li>
            </ul>
          </fieldset>
          <fieldset className='toggle'>
            <legend>Predicted Road Layers</legend>
            <ul>
              <li className='toggle__item toggle__all'>
                <a className={c({showall: hidden.length >= 1})} href="#" onClick={this.toggleVisibility.bind(this, 'all')}>
                  <icon className='visibility'><span>Hide/Show</span></icon>
                  <span className='line-description'>All Predicted</span>
                </a>
              </li>
              <li className='toggle__item'>
                <a className={c({showall: hidden.indexOf(INCOMPLETE) > -1})} href="#" onClick={this.toggleVisibility.bind(this, INCOMPLETE)}>
                  <icon className='visibility'><span>Hide/Show</span></icon>
                  <span className='line__item line--incomplete line-description'>Incomplete</span>
                </a>
              </li>
              <li className='toggle__item'>
                <a className={c({showall: hidden.indexOf(EDITED) > -1})} href="#" onClick={this.toggleVisibility.bind(this, EDITED)}>
                  <icon className='visibility'><span>Hide/Show</span></icon>
                  <span className='line-description line__item line--progress'>In Progress</span>
                </a>
              </li>
              <li className='toggle__item'>
                <a className={c({showall: hidden.indexOf(COMPLETE) > -1})} href="#" onClick={this.toggleVisibility.bind(this, COMPLETE)}>
                  <icon className='visibility'><span>Hide/Show</span></icon>
                  <span className='line-description line__item line--complete'>Complete</span>
                </a>
              </li>
            </ul>
          </fieldset>
          <fieldset className='toggle'>
            <legend>Existing Road Network Layers</legend>
            <ul>
              <li className='toggle__item'>
                <a className={c({showall: showExistingRoads})} href="#" onClick={this.toggleExistingRoads}>
                  <icon className='visibility'><span>Hide/Show</span></icon>
                  <span className='line__item line--existing line-description'>Existing roads</span>
                </a>
              </li>
            </ul>
          </fieldset>
        </div>
      </div>
    );
  },

  propTypes: {
    dispatch: React.PropTypes.func,
    selection: React.PropTypes.object,
    map: React.PropTypes.object,
    draw: React.PropTypes.object,
    save: React.PropTypes.object
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
    draw: state.draw,
    save: state.save
  };
}

export default connect(mapStateToProps)(Map);

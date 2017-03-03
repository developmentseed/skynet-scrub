'use strict';
import React from 'react';
import { connect } from 'react-redux';
import glSupported from 'mapbox-gl-supported';
import c from 'classnames';
import bboxPolygon from 'turf-bbox-polygon';
import { tiles } from 'tile-cover';
import { mapboxgl, MapboxDraw } from '../../util/window';

import { MAP_STATUS } from '../../reducers/map';
import drawStyles from './styles/mapbox-draw-styles';
import { updateSelection, undo, redo, completeUndo, completeRedo, fetchMapData,
  completeMapUpdate } from '../../actions';

const glSupport = glSupported();
const noGl = (
  <div className='nogl'>
    <p>Sorry, but your browser does not support GL.</p>
  </div>
);
const id = 'main-map-component';
const Map = React.createClass({
  initMap: function (el) {
    if (el && !this.map && glSupport) {
      mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZWd5cHQiLCJhIjoiY2l6ZTk5YTNxMjV3czMzdGU5ZXNhNzdraSJ9.HPI_4OulrnpD8qI57P12tg';
      this.map = new mapboxgl.Map({
        center: [125.48, 9.7],
        container: el,
        scrollWheelZoom: false,
        style: 'mapbox://styles/mapbox/satellite-v9',
        zoom: 11
      });
      const draw = new MapboxDraw({
        styles: drawStyles,
        displayControlsDefault: false,
        controls: { trash: true, line_string: true }
      });
      this.map.addControl(draw);
      this.draw = draw;
      window.Draw = draw;
      this.map.on('draw.create', (e) => {
        this.props.dispatch(updateSelection(e.features.map(f => {
          return { id: f.id, undo: null, redo: f };
        })));
      });
      this.map.on('draw.delete', (e) => {
        this.props.dispatch(updateSelection(e.features.map(f => {
          return { id: f.id, undo: f, redo: null };
        })));
      });
      this.map.on('draw.update', (e) => {
        this.props.dispatch(updateSelection(e.features.map(f => {
          const oldFeature = this.selection.find(a => a.id === f.id);
          return { id: f.id, undo: oldFeature, redo: f };
        })));
        this.selection = draw.getSelected().features;
      });
      this.map.on('draw.selectionchange', (e) => {
        if (e.features.length) {
          // internal state used to track "previous state" of edited geometry
          this.selection = e.features;
        }
      });
      this.map.on('load', (e) => {
        this.loadMapData(e);
      });
      this.map.on('moveend', (e) => {
        this.loadMapData(e);
      });
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

    // if we have a dirty store, update the Draw.store with it then mark it as
    // clean
    if (nextProps.map.status === MAP_STATUS.DIRTY) {
      nextProps.map.store.forEach((value, key) => {
        // like our internal store, only add, no deletes or updates
        if (!this.draw.get(key)) {
          this.draw.add(Object.assign({}, value, { id: key }));
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
    this.props.dispatch(fetchMapData(coverTile));
  },

  render: function () {
    const { past, future } = this.props.selection;
    if (!glSupport) { return noGl; }
    return (
        <div className='map__container' ref={this.initMap} id={id}>
        <button className={c({disabled: !past.length})} onClick={this.undo}>Undo</button>
        <button className={c({disabled: !future.length})} onClick={this.redo}>Redo</button>
        </div>
    );
  },

  propTypes: {
    dispatch: React.PropTypes.func,
    selection: React.PropTypes.object,
    map: React.PropTypes.object
  }
});

function mapStateToProps (state) {
  return {
    selection: state.selection,
    map: state.map
  };
}

export default connect(mapStateToProps)(Map);

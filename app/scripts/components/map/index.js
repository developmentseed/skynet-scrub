'use strict';
import React from 'react';
import { connect } from 'react-redux';
import glSupported from 'mapbox-gl-supported';
import { mapboxgl, MapboxDraw } from '../../util/window';
import drawStyles from './styles/mapbox-draw-styles';

const glSupport = glSupported();
const noGl = (
  <div className='nogl'>
    <p>Sorry, but your browser does not support GL.</p>
  </div>
);
const id = 'main-map-component';
const Map = React.createClass({
  displayName: 'Map',

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
        controls: { trash: true }
      });
      this.map.addControl(draw);
    }
  },

  render: function () {
    if (!glSupport) { return noGl; }
    return (
      <div className='map__container' ref={this.initMap} id={id}></div>
    );
  }
});

export default connect(state => state)(Map);

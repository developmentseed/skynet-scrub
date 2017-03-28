/* eslint-disable no-unused-vars */
import React from 'react';
import test from 'tape';
import mock from 'mapbox-gl-js-mock';
import window, * as global from '../app/scripts/util/window';
global.glSupport = true;
import { Map } from '../app/scripts/components/map';
import { mount } from 'enzyme';

global.mapboxgl = mock;

// stub mapbox draw
const draw = () => true;
draw.prototype.add = () => true;
draw.prototype.onAdd = () => true;
draw.prototype.getSelected = () => ({ features: [{ properties: {} }] });
global.MapboxDraw = draw;

function setup (options) {
  options = options || {};
  const props = Object.assign({
    selection: {
      past: [],
      present: { historyId: 'initial' },
      future: []
    },
    map: {
      showExistingRoads: false
    },
    draw: {
      mode: null,
      hidden: []
    },
    save: {}
  }, options);
  const map = mount(<Map {...props} />);

  return {
    props,
    map
  };
}

test('map', function (t) {
  const args = [];
  setup({ dispatch: (d) => args.push(d) });
  const event = {
    features: [
      {id: 1, type: 'Feature', geometry: {type: 'Point', coordinates: [0, 0]}, properties: {}},
      {id: 2, type: 'Feature', geometry: {type: 'Point', coordinates: [0, 0]}, properties: {}},
      {id: 3, type: 'Feature', geometry: {type: 'Point', coordinates: [0, 0]}, properties: {}}
    ]
  };
  window.map.fire('draw.create', event);
  window.map.fire('draw.delete', event);
  window.map.fire('draw.selectionchange', { features: [{id: 1, type: 'Feature', geometry: {}, properties: {}}] });
  window.map.fire('draw.update', event);

  args.forEach(d => t.equals(d.type, 'UPDATE_SELECTION'));
  t.equals(args.length, 3);
  t.end();
});


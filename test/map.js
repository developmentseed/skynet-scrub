/* eslint-disable no-unused-vars */
import React from 'react';
import test from 'tape';
import mock from 'mapbox-gl-js-mock';
import g from '../app/scripts/util/window';
g.glSupport = true;
import { Map } from '../app/scripts/components/map';
import { mount } from 'enzyme';

g.mapboxgl = mock;

import jsdom from 'jsdom';
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = g.window = doc.defaultView;
global.document = g.window.document = doc;

// stub mapbox draw
const draw = () => true;
draw.prototype.add = () => true;
draw.prototype.onAdd = () => true;
draw.prototype.getSelected = () => ({ features: [{ properties: {} }] });
g.MapboxDraw = draw;

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
  g.map.fire('draw.create', event);
  g.map.fire('draw.delete', event);
  g.map.fire('draw.selectionchange', { features: [{id: 1, type: 'Feature', geometry: {}, properties: {}}] });
  g.map.fire('draw.update', event);

  args.forEach(d => t.ok(d.type === 'UPDATE_SELECTION' || d.type === 'CHANGE_DRAW_MODE'));
  t.equals(args.length, 5);
  t.end();
});

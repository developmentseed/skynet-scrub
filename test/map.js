/* eslint-disable no-unused-vars */
import React from 'react';
import test from 'tape';
import mock from 'mapbox-gl-js-mock';
import g from '../app/scripts/util/window';
import proxyquire from 'proxyquire';
g.glSupport = true;
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
draw.prototype.getSelectedPoints = () => ({ features: [{ properties: {} }] });
draw.prototype.getMode = () => 'simple_select';
draw.prototype.changeMode = () => true;

const { Map } = proxyquire.noCallThru().load('../app/scripts/components/map', {
  '@mapbox/mapbox-gl-draw': draw
});

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
      {id: 1, type: 'Feature', geometry: {type: 'LineString', coordinates: [[1, 1], [2, 2]]}, properties: {}},
      {id: 2, type: 'Feature', geometry: {type: 'LineString', coordinates: [[1, 1], [2, 2]]}, properties: {}},
      {id: 3, type: 'Feature', geometry: {type: 'LineString', coordinates: [[1, 1], [2, 2]]}, properties: {}}
    ]
  };
  g.map.fire('draw.create', event);
  g.map.fire('draw.delete', event);
  g.map.fire('draw.selectionchange', { features: [{id: 1, type: 'LineString', geometry: {}, properties: {}}] });
  g.map.fire('draw.update', event);

  args.forEach(d => t.ok(d.type === 'UPDATE_SELECTION' || d.type === 'CHANGE_DRAW_MODE'));
  t.equals(args.length, 5);
  t.end();
});

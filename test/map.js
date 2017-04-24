/* eslint-disable no-unused-vars */
import React from 'react';
import test from 'tape';
import mock from 'mapbox-gl-js-mock';
import proxyquire from 'proxyquire';
import { mount } from 'enzyme';
import App from '../app/scripts/util/app';
App.glSupport = true;

// stub global DOM methods
import jsdom from 'jsdom';
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = doc.defaultView;
global.document = doc;

// stub mapbox draw
const draw = () => true;
draw.prototype.add = () => true;
draw.prototype.onAdd = () => true;
draw.prototype.getSelected = () => ({ features: [{ properties: {} }] });
draw.prototype.getSelectedPoints = () => ({ features: [{ properties: {} }] });
draw.prototype.getMode = () => 'simple_select';
draw.prototype.changeMode = () => true;

const { Map } = proxyquire.noCallThru().load('../app/scripts/components/map', {
  '@mapbox/mapbox-gl-draw': draw,
  'mapbox-gl': mock,
  '../../util/app': App
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

  App.map.fire('draw.create', event);
  App.map.fire('draw.delete', event);
  App.map.fire('draw.selectionchange', { features: [{id: 1, type: 'LineString', geometry: {}, properties: {}}] });
  App.map.fire('draw.update', event);

  args.forEach(d => t.ok(d.type === 'UPDATE_SELECTION' || d.type === 'CHANGE_DRAW_MODE'));
  t.equals(args.length, 5);
  t.end();
});

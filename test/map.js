/* eslint-disable no-unused-vars */
import React from 'react';
import test from 'tape';
import sinon from 'sinon';
import window, * as global from '../app/scripts/util/window';
global.glSupport = true;
import { Map } from '../app/scripts/components/map';
import { mount } from 'enzyme';

const noop = () => true;

// stub mapbox gl
const mockbox = () => true;
const context = {
  events: {}
};
mockbox.prototype.addControl = noop;
mockbox.prototype.on = (action, handler) => {
  context.events[action] = handler;
};
mockbox.prototype.trigger = (action, eventObject) => {
  eventObject = eventObject || {};
  context.events[action].call(null, eventObject);
};
global.mapboxgl = { Map: mockbox };

// stub mapbox draw
const draw = () => true;
draw.prototype.add = noop;
draw.prototype.getSelected = () => [{}];
global.MapboxDraw = draw;

function setup (options) {
  options = options || {};
  const props = Object.assign({
    selection: {
      past: [],
      future: []
    },
    draw: {
      mode: null
    }
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
      {id: 1, properties: {}},
      {id: 2, properties: {}},
      {id: 3, properties: {}}
    ]
  };
  window.map.trigger('draw.create', event);
  window.map.trigger('draw.delete', event);
  window.map.trigger('draw.selectionchange', { features: [{}] });
  window.map.trigger('draw.update', event);

  args.forEach(d => t.equals(d.type, 'UPDATE_SELECTION'));
  t.end();
});


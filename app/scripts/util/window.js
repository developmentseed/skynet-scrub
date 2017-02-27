'use strict';
import { jsdom } from 'jsdom';
import glSupported from 'mapbox-gl-supported';

const isNode = typeof window === 'undefined';
const _ = isNode ? jsdom('<div id="site-canvas"></div>').defaultView : window;
if (isNode) {
  global.window = _;
  global.document = _.document;
  global.navigator = _.navigator;
}
const isSupported = !isNode && glSupported();
export const mapboxgl = isSupported ? _.mapboxgl : () => true;
export default _;

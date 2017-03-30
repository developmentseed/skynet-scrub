'use strict';
import check from 'mapbox-gl-supported';
const isNode = typeof window === 'undefined';
const _ = isNode ? {} : window;
export const mapboxgl = !isNode ? _.mapboxgl : () => true;
export const MapboxDraw = !isNode ? _.MapboxDraw : () => true;
export const glSupport = check();
export default _;

'use strict';
import check from 'mapbox-gl-supported';
const isBrowser = typeof window !== 'undefined';
const g = {};
g.window = isBrowser ? window : {};
g.mapboxgl = isBrowser ? window.mapboxgl : () => true;
g.MapboxDraw = isBrowser ? window.MapboxDraw : () => true;
g.glSupport = check();
export default g;

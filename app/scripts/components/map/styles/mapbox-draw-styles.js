'use strict';
const styles = [
  // line stroke
  {
    'id': 'gl-draw-line-inactive',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'false']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#D20C0C',
      'line-width': 4
    }
  },
  {
    'id': 'gl-draw-line-active',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'true']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#D20C0C',
      'line-dasharray': [0.2, 2],
      'line-width': 3
    }
  },
  // line stroke, status 1
  {
    'id': 'gl-draw-line-inactive-edited',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'false'], ['==', 'user_status', 'edited']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#0000ff',
      'line-width': 4
    }
  },
  {
    'id': 'gl-draw-line-active-edited',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'true'], ['==', 'user_status', 'edited']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#0000ff',
      'line-dasharray': [0.2, 2],
      'line-width': 3
    }
  },
  // vertex point halos
  {
    'id': 'gl-draw-polygon-and-line-vertex-halo-simple-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static'], ['==', 'active', 'false']],
    'paint': {
      'circle-radius': 6,
      'circle-color': '#FFF'
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-halo-simple-active',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static'], ['==', 'active', 'true']],
    'paint': {
      'circle-radius': 7,
      'circle-color': '#FFF'
    }
  },
  // vertex points
  {
    'id': 'gl-draw-polygon-and-line-vertex-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static'], ['==', 'active', 'false']],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#D20C0C'
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-active',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static'], ['==', 'active', 'true']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#0F0'
    }
  },
  // midpoints
  {
    'id': 'gl-draw-midpoints',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#D20C0C'
    }
  },

  // INACTIVE (static, already drawn)
  {
    'id': 'gl-draw-line-vertex-static',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'], ['==', 'mode', 'static']],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#000'
    }
  },
  // line stroke
  {
    'id': 'gl-draw-line-static',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#000',
      'line-width': 3
    }
  }
];
export default styles;

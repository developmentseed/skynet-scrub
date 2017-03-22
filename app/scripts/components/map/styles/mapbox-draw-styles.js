'use strict';
const styles = [
  // line stroke
  {
    'id': 'gl-draw-line-inactive',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'false'], ['!=', 'user_visibility', 'none']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': 'rgba(209, 209, 209, .7)',
      'line-width': 3
    }
  },
  {
    'id': 'gl-draw-line-active',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'true'], ['!=', 'user_visibility', 'none']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': 'rgba(209, 209, 209, .7)',
      'line-dasharray': [0.2, 2],
      'line-width': 3
    }
  },
  // line stroke, status 1
  {
    'id': 'gl-draw-line-inactive-edited',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'false'], ['==', 'user_status', 'edited'], ['!=', 'user_visibility', 'none']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': 'rgba(255, 210, 59, .9)',
      'line-width': 3
    }
  },
  {
    'id': 'gl-draw-line-active-edited',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'true'], ['==', 'user_status', 'edited'], ['!=', 'user_visibility', 'none']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': 'rgba(255, 210, 59, .9)',
      'line-dasharray': [0.2, 2],
      'line-width': 3
    }
  },
  {
    'id': 'gl-draw-line-inactive-complete',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'false'], ['==', 'user_status', 'complete'], ['!=', 'user_visibility', 'none']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#5EED94',
      'line-width': 3
    }
  },
  {
    'id': 'gl-draw-line-active-complete',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static'], ['==', 'active', 'true'], ['==', 'user_status', 'complete'], ['!=', 'user_visibility', 'none']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#5EED94',
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
      'circle-color': '#3E3A3A'
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-halo-simple-active',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static'], ['==', 'active', 'true']],
    'paint': {
      'circle-radius': 7,
      'circle-color': '#3E3A3A',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#3E3A3A'
    }
  },
  // vertex points
  {
    'id': 'gl-draw-polygon-and-line-vertex-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static'], ['==', 'active', 'false']],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#FFF'
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-active',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static'], ['==', 'active', 'true']],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#FFF'
    }
  },
  // midpoints
  {
    'id': 'gl-draw-midpoints',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#FFF'
    }
  },
  // line visibility
  {
    'id': 'gl-draw-visibility',
    'type': 'line',
    'filter': ['==', 'user_visibility', 'none'],
    'visibility': 'none',
    'paint': {
      'line-opacity': 0
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

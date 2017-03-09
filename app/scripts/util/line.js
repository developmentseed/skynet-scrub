'use strict';
export const firstCoord = (line) => line.geometry.coordinates[0];
export const lastCoord = (line) => line.geometry.coordinates[line.geometry.coordinates.length - 1];

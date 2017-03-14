'use strict';
import store from 'store2';
import { compressChanges } from './compress-changes';
const KEY = 'skynet_scrub_local';
const NULL = 'null';

export function getLocalActions () {
  const stored = store.get(KEY);
  return stored === NULL ? false : stored;
}

export function destroyLocalActions () {
  const stored = store.get(KEY);
  store.set(KEY, NULL);
  return stored === NULL ? false : stored;
}

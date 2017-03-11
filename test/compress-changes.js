'use strict';
import test from 'tape';
import compress from '../app/scripts/util/compress-changes';

test('compression', function (t) {
  // modification, then deletion
  let payload = compress([
    {selection: [{id: 1, redo: 1, undo: 1}]},
    {selection: [{id: 1, redo: 1, undo: 1}]},
    {selection: [{id: 1, redo: 1, undo: 1}]},
    {selection: [{id: 1, redo: 1, undo: 1}]},
    {selection: [{id: 1, redo: 1, undo: 1}]},
    {selection: [{id: 1, redo: 1, undo: 1}]},
    {selection: [{id: 1, redo: 0, undo: 1}]}
  ]);
  t.equal(payload.deleted.length, 1);
  t.equal(payload.edited.length, 0);

  // creation, then deletion
  payload = compress([
    {selection: [{id: 1, redo: 1, undo: 0}]},
    {selection: [{id: 1, redo: 0, undo: 1}]}
  ]);
  t.equal(payload.deleted.length, 0);
  t.equal(payload.edited.length, 0);

  // creation, then modification
  payload = compress([
    {selection: [{id: 1, redo: 1, undo: 0}]},
    {selection: [{id: 1, redo: 2, undo: 1}]}
  ]);
  t.equal(payload.deleted.length, 0);
  t.equal(payload.edited.length, 1);
  t.equal(payload.edited[0], 2);

  // creation, modification, then deletion (but starting from after the creation)
  // without the historyId param, this would produce an empty payload
  payload = compress([
    {historyId: 0, selection: [{id: 1, redo: 1, undo: 0}]},
    {historyId: 1, selection: [{id: 1, redo: 2, undo: 1}]},
    {historyId: 2, selection: [{id: 1, redo: 0, undo: 1}]}
  ], 0);
  t.equal(payload.deleted.length, 1);
  t.equal(payload.edited.length, 0);

  t.end();
});

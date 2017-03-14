'use strict';
import test from 'tape';
import compress, { compressChanges } from '../app/scripts/util/compress-changes';

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

test('compress changes', function (t) {
  const selectionArray = [{
    historyId: 0,
    selection: [{ id: 'a', undo: 0, redo: 1 }, { id: 'b', undo: 1, redo: 2 }] // create a, modify b
  }, {
    historyId: 1,
    selection: [{ id: 'a', undo: 1, redo: 2 }] // modify a
  }, {
    historyId: 2,
    selection: [{ id: 'b', undo: 2, redo: 3 }] // modify b
  }, {
    historyId: 3,
    selection: [{ id: 'a', undo: 2, redo: 0 }, { id: 'b', undo: 3, redo: 0 }, { id: 'c', undo: 0, redo: 1 }] // delete a, delete b, create c
  }];
  let payload = compressChanges(selectionArray);
  t.equals(payload.find(d => d.id === 'a'), undefined); // a is created and deleted in the same change
  t.deepEquals(payload.find(d => d.id === 'b'), { id: 'b', undo: 1, redo: 0 });
  t.deepEquals(payload.find(d => d.id === 'c'), { id: 'c', undo: 0, redo: 1 });

  payload = compressChanges(selectionArray, 1);
  t.deepEquals(payload.find(d => d.id === 'a'), { id: 'a', undo: 2, redo: 0 });
  t.deepEquals(payload.find(d => d.id === 'b'), { id: 'b', undo: 2, redo: 0 });
  t.deepEquals(payload.find(d => d.id === 'c'), { id: 'c', undo: 0, redo: 1 });
  t.end();
});

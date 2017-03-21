import test from 'tape';
import nock from 'nock';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

import { save } from '../app/scripts/actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

test('save', function (t) {
  t.test('creates SAVE actions', function (st) {
    nock('http://localhost:4030/')
      .post('/commit')
      .reply(200, { body: 'ok' });

    const store = mockStore({});
    const selectionArray = [{
      historyId: 'initial',
      selection: [
        {
          id: '1',
          redo: {
            id: '',
            type: 'Feature',
            geometry: {},
            properties: { status: 'incomplete' }
          },
          undo: {
            id: '',
            type: 'Feature',
            geometry: {},
            properties: { status: 'edited' }
          }
        }
      ]
    }];

    const expectedActions = JSON.stringify([
      { type: 'SAVE', data: { inflight: true, error: null } },
      { type: 'SAVE', data: { historyId: 'initial', inflight: false, error: null, success: true } }
    ]);

    return store.dispatch(save(selectionArray)).then(() => {
      t.equal(JSON.stringify(store.getActions()), expectedActions);
      st.end();
    });
  });

  nock.cleanAll();
  t.end();
});

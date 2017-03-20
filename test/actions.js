import test from 'tape';
import nock from 'nock';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

import { save } from '../scripts/actions';

const middlewares = [ thunk ]
const mockStore = configureMockStore(middlewares)

test('save', function (t) {
  afterEach(() => {
    nock.cleanAll();
  });

  t.test('', function (t) {
    const store = mockStore({})
    const past
    const historyId

    return store.dispatch(actions.save(past, historyId)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
      t.end();
    })
  });
});

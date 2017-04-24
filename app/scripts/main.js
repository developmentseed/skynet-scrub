'use strict';
import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import { useScroll } from 'react-router-scroll';
import createLogger from 'redux-logger';
import { Router, Route, IndexRoute, hashHistory, applyRouterMiddleware } from 'react-router';

import config from './config';
import reducers from './reducers';

import App from './components/app';
import NotFound from './components/app/not-found';
import Home from './components/home';

const logger = createLogger({
  level: 'info',
  collapsed: true,
  predicate: (getState, action) => {
    return (config.environment !== 'production');
  }
});

const store = createStore(reducers, applyMiddleware(
  thunkMiddleware,
  logger
));

console.log.apply(console, config.consoleMessage);
console.log('Environment', config.environment);

render((
  <Provider store={store}>
    <Router history={hashHistory} render={applyRouterMiddleware(useScroll())}>
      <Route path='/404' component={NotFound} />
      <Route path='/' component={App}>
        <IndexRoute component={Home} />
      </Route>
    </Router>
  </Provider>
), document.getElementById('site-canvas'));

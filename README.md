# Skynet scrub

Contains code and unit tests for the Skynet Scrubber, a GUI for cleaning machine learning output data.

# Installation

Requires node v6.9. We recommend using [nvm](https://github.com/creationix/nvm) to manage node versions.

```(bash)
nvm use
npm install
npm run start
```

# Development

## On accessing global `window` methods

Currently we use [tape](https://github.com/substack/tape) for unit tests. Tape is light-weight with a simple API. One consequence is that, unlike other runners that bundle Phantomjs (mocha, etc), tape does not include a browser environment to run client-side code.

This isn't a problem as long as we import the native globals we need, ie `localStorage`, `navigator`, `document`, etc. from `app/scripts/util/window`. We use [js-dom](https://github.com/tmpvar/jsdom) to stub `window` and `document`, and can use [mock-browser](https://github.com/darrylwest/mock-browser) for methods that js-dom doesn't support, like storage.

## On testing and linting

```(javascript)
npm run test
```

'use strict';
import React from 'react';
import { connect } from 'react-redux';
import Map from './map';
import AutoSave from './auto-save';

var Home = React.createClass({
  displayName: 'Home',

  render: function () {
    return (
      <div className='full'>
        <Map />
        <AutoSave />
      </div>
    );
  }
});
export default connect(state => state)(Home);

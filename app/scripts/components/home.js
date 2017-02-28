'use strict';
import React from 'react';
import { connect } from 'react-redux';
import Map from './map';

var Home = React.createClass({
  displayName: 'Home',

  render: function () {
    return (<Map />);
  }
});
export default connect(state => state)(Home);

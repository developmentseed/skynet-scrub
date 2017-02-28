'use strict';
import React from 'react';
import { connect } from 'react-redux';

var Home = React.createClass({
  displayName: 'Home',

  render: function () {
    return (
      <div>Home view</div>
    );
  }
});
export default connect(state => state)(Home);

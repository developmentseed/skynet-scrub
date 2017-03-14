'use strict';
import React from 'react';
import { connect } from 'react-redux';
import * as autosave from '../util/auto-save';
import { compressChanges } from '../util/compress-changes';
import { updateSelection, updateLocalStore } from '../actions';

const INTERVAL = 1000;
export const AutoSave = React.createClass({

  componentWillMount: function () {
    const unsaved = autosave.getLocalActions();
    if (unsaved) {
      this.props.dispatch(updateLocalStore(unsaved));
    }
    const interval = setInterval(this.store, INTERVAL);
    this.cancel = () => clearInterval(interval);
  },

  componentWillUnmount: function () {
    this.cancel();
  },

  store: function () {
    const { historyId } = this.props.save;
    const { past } = this.props.selection;
    if (!past.length || historyId === past[past.length - 1].historyId) return;
    const compressed = historyId
      ? compressChanges(past, historyId) : compressChanges(past);
    autosave.saveLocalActions(compressed);
  },

  restore: function () {
    const { cached } = this.props.save;
    this.props.dispatch(updateSelection(cached));
    this.props.dispatch(updateLocalStore(null));
  },

  describeAction: function (action) {
    if (action.undo && action.redo) return 'Modified';
    else if (action.undo) return 'Deleted';
    else return 'Created';
  },

  renderCached: function (cached) {
    const items = cached.map(action => (
      <li key={action.id}><strong>{this.describeAction(action)}</strong>: {action.id}</li>
    ));
    return (
      <div>
        <ul className='cached'>{items}</ul>
        <button onClick={this.restore}>Restore</button>
      </div>
    );
  },

  render: function () {
    const { cached } = this.props.save;
    return (
      <div className='autosave'>
        { cached ? <div className='modal__cover'></div> : null }
        { cached ? <div className='modal'>{this.renderCached(cached)}</div> : null }
      </div>
    );
  },

  propTypes: {
    dispatch: React.PropTypes.func,
    selection: React.PropTypes.object,
    save: React.PropTypes.object
  }
});

function mapStateToProps (state) {
  return {
    selection: state.selection,
    save: state.save
  };
}

export default connect(mapStateToProps)(AutoSave);

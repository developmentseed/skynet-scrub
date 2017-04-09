'use strict';
import React from 'react';
import { connect } from 'react-redux';
import * as autosave from '../util/auto-save';
import { compressChanges } from '../util/compress-changes';
import { fastForward, updateLocalStore } from '../actions';

export const AutoSave = React.createClass({

  componentWillMount: function () {
    const unsaved = autosave.getLocalActions();
    if (unsaved) {
      this.props.dispatch(updateLocalStore(unsaved));
    }
  },

  componentWillReceiveProps: function (newProps) {
    const { historyId, success } = newProps.save;
    const { past } = newProps.selection;
    if (success && autosave.getLocalActions()) {
      // on save success, if there's any stored items, remove them.
      this.forget();
    } else if (past.length && historyId !== past[past.length - 1].historyId) {
      // if we have unsaved changes, persist them to localStorage.
      this.store(past, historyId);
    }
  },

  store: function (past, historyId) {
    // compress the past selection array as a single action.
    const compressed = historyId ? compressChanges(past, historyId) : compressChanges(past);
    autosave.saveLocalActions(compressed);
  },

  restore: function () {
    const { cached } = this.props.save;
    this.props.dispatch(fastForward(cached));
    this.forget();
  },

  forget: function () {
    this.props.dispatch(updateLocalStore(null));
    autosave.destroyLocalActions();
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
        <h2 className='heading--medium with-description'>Save Your Changes</h2>
        <p>By leaving this page all changes below will be deleted.</p>
        <ul className='cached modal__files-changed'>{items}</ul>
        <button className='button button-base button--group' onClick={this.restore}>Restore</button>
        <button className='button button--outline button--secondary button--group' onClick={this.forget}>Delete & Exit</button>
      </div>
    );
  },

  render: function () {
    const { cached } = this.props.save;
    return (
      <div className='autosave'>
        { cached ? <div className='modal__cover'></div> : null }
        { cached ? (
          <div className='modal'>
            <div className='modal__inner'>
              {this.renderCached(cached)}
            </div>
          </div>
        ) : null }
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

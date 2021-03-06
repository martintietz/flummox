'use strict';

import Actions from '../Actions';
import sinon from 'sinon';

describe('Actions', () => {

  class TestActions extends Actions {
    getFoo() {
      return { foo: 'bar' };
    }

    getBar() {
      return { bar: 'baz' };
    }

    getBaz() {
      return;
    }

    async asyncAction(returnValue) {
      return returnValue;
    }

    badAsyncAction() {
      return Promise.reject(new Error('some error'));
    }
  }

  describe('#getActionIds / #getConstants', () => {
    it('returns strings corresponding to action method names', () => {
      let actions = new TestActions();

      let actionIds = actions.getActionIds();

      expect(actionIds.getFoo).to.be.a('string');
      expect(actionIds.getBar).to.be.a('string');

      expect(actionIds.getFoo).to.be.a('string');
      expect(actionIds.getBar).to.be.a('string');
    });

  });

  describe('#[methodName]', () => {
    it('calls Flux dispatcher', () => {
      let actions = new TestActions();

      // Attach mock flux instance
      let dispatch = sinon.spy();
      actions.dispatch = dispatch;

      actions.getFoo();
      expect(dispatch.firstCall.args[1]).to.deep.equal({ foo: 'bar' });
    });

    it('throws if actions have not been added to a Flux instance', () => {
      let actions = new TestActions();

      expect(actions.getFoo.bind(actions))
        .to.throw(
          'You\'ve attempted to perform the action TestActions#getFoo, but it '
        + 'hasn\'t been added to a Flux instance.'
        );
    });

    it('sends return value to Flux dispatch', () => {
      let actions = new TestActions();
      let actionId = actions.getActionIds().getFoo;
      let dispatch = sinon.spy();
      actions.dispatch = dispatch;

      actions.getFoo();

      expect(dispatch.firstCall.args[0]).to.equal(actionId);
      expect(dispatch.firstCall.args[1]).to.deep.equal({ foo: 'bar' });
    });

    it('send async return value to Flux#dispatchAsync', async function() {
      let actions = new TestActions();
      let actionId = actions.getActionIds().asyncAction;
      let dispatch = sinon.stub().returns(Promise.resolve());
      actions.dispatchAsync = dispatch;

      let response = actions.asyncAction('foobar');

      expect(response.then).to.be.a('function');

      await response;

      expect(dispatch.firstCall.args[0]).to.equal(actionId);
      expect(dispatch.firstCall.args[1]).to.be.an.instanceOf(Promise);
    });

    it('skips disptach if return value is undefined', () => {
      let actions = new TestActions();
      let dispatch = sinon.spy();
      actions.dispatch = dispatch;

      actions.getBaz();

      expect(dispatch.called).to.be.false;
    });

    it('does not skip async dispatch, even if resolved value is undefined', () => {
      let actions = new TestActions();
      let dispatch = sinon.spy();
      actions.dispatchAsync = dispatch;

      actions.asyncAction(undefined);

      expect(dispatch.called).to.be.true;
    });

    it('returns undefined if action is synchronous', () => {
      let actions = new TestActions();
      actions.dispatch = function() {};

      expect(actions.getFoo()).to.be.undefined;
    });
  });

});

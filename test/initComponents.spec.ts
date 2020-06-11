// eslint-disable-next-line max-classes-per-file
import { expect, use } from 'chai';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';

import initComponents from '../src/lib/utils/initComponents';
import { registerComponent } from '../src/lib/utils/componentStore';
import { createHTML, getTestComponentClass } from './helpers';

use(sinonChai);

describe('initComponents', () => {
  it('should test mount and adopt lifecycle methods', () => {
    const mountSpy = spy();
    const adoptSpy = spy();

    const foo = getTestComponentClass('foo', { mountSpy, adoptSpy });
    registerComponent(foo);

    const bar = getTestComponentClass('bar', { mountSpy, adoptSpy });
    registerComponent(bar);

    const div = createHTML(`
      <div>
        <div data-component="foo">
          foo
          <div data-component="bar">
            Foobar
            <div class="container"></div>
          </div>
        </div>
      </div>
    `);

    initComponents(div);

    // should have been called twice
    expect(mountSpy).to.have.been.calledTwice;
    expect(adoptSpy).to.have.been.calledTwice;

    // should have called mounted before adopted
    expect(mountSpy).to.have.been.calledBefore(adoptSpy);

    // should have called bar before foo
    expect(mountSpy.args).to.deep.equals([['bar'], ['foo']]);

    const inner = createHTML(`
      <div>
        <div data-component="foo">
        </div>
      </div>
    `);

    div.querySelector('.container').appendChild(inner);

    initComponents(inner);

    expect(mountSpy).to.have.been.calledThrice;
    expect(adoptSpy).to.have.been.calledThrice;

    expect(mountSpy.args).to.deep.equal([['bar'], ['foo'], ['foo']]);
    expect(adoptSpy.args).to.deep.equal([['bar'], ['foo'], ['foo']]);
  });
});

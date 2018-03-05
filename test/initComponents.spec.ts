import { expect, use } from 'chai';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';

import initComponents from '../src/lib/utils/initComponents';
import { registerComponent } from '../src/lib/utils/componentStore';
import { createHTML } from './helpers';

use(sinonChai);

describe('initComponents', () => {
  it('should test mount and adopt lifecycle methods', () => {

    const mountSpy =  spy();
    const adoptSpy =  spy();

    const foo = class Foo {
      static displayName: string = 'foo';

      constructor() {
        // dom ready
        mountSpy('foo');
      }

      adopted() {
        // fully adopted in tree
        adoptSpy('foo');
      }
    };
    registerComponent(foo);

    const bar = class Bar {
      static displayName: string = 'bar';

      constructor() {
        // dom ready
        mountSpy('bar');
      }

      adopted() {
        // fully adopted in tree
        adoptSpy('bar');
      }
    };
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

    expect(mountSpy).to.have.been.calledTwice;
    expect(adoptSpy).to.have.been.calledTwice;
    expect(mountSpy).to.have.been.calledBefore(adoptSpy);

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

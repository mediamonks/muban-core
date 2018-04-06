import { expect, use } from 'chai';
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';
import {renderItem, renderItems} from '../src/lib/utils/dataUtils';

import initComponents from '../src/lib/utils/initComponents';
import { registerComponent } from '../src/lib/utils/componentStore';
import { createHTML } from './helpers';

use(sinonChai);

describe('dataUtils', () => {
  describe('renderItem', () => {
    it('should replace an item', () => {

      const compiled:any = new Function('return ' + Handlebars.precompile(fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8')))();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();
      const adoptSpy = spy();
      const destructSpy = spy();

      const foo = class Foo {
        static displayName:string = 'foo';

        constructor() {
          // dom ready
          mountSpy('foo');
        }

        adopted() {
          // fully adopted in tree
          adoptSpy('foo');
        }

        dispose() {
          destructSpy('foo');
        }
      };
      registerComponent(foo);

      const div = createHTML(`
        <div>
          <div data-component="foo">
            foo
          </div>
          <div data-component="foo">
            foo
          </div>
        </div>
      `);

      initComponents(div);

      const item = renderItem<HTMLDivElement>(div, template, {text: 'foobar'});

      expect(mountSpy).to.have.been.calledThrice;
      expect(adoptSpy).to.have.been.calledThrice;
      expect(item).to.not.be.oneOf([null, undefined, false]);

      const fooCount = div.querySelectorAll('[data-component="foo"]').length;

      expect(fooCount).to.equal(1);
    });

    it('should append an item', () => {

      const compiled:any = new Function('return ' + Handlebars.precompile(fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8')))();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();
      const adoptSpy = spy();
      const destructSpy = spy();

      const foo = class Foo {
        static displayName:string = 'foo';

        constructor() {
          // dom ready
          mountSpy('foo');
        }

        adopted() {
          // fully adopted in tree
          adoptSpy('foo');
        }

        dispose() {
          destructSpy('foo');
        }
      };
      registerComponent(foo);

      const div = createHTML(`
        <div>
          <div data-component="foo">
            foo
          </div>
          <div data-component="foo">
            foo
          </div>
        </div>
      `);

      initComponents(div);

      const item = renderItem<HTMLDivElement>(div, template, {text: 'foobar'}, true);

      expect(mountSpy).to.have.been.calledThrice;
      expect(adoptSpy).to.have.been.calledThrice;
      expect(item).to.not.be.oneOf([null, undefined, false]);

      const fooCount = div.querySelectorAll('[data-component="foo"]').length;

      expect(fooCount).to.equal(3);
    });
  });


  describe('renderItems', () => {
    it('should replace a items', () => {

      const compiled:any = new Function('return ' + Handlebars.precompile(fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8')))();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();
      const adoptSpy = spy();
      const destructSpy = spy();

      const foo = class Foo {
        static displayName:string = 'foo';

        constructor() {
          // dom ready
          mountSpy('foo');
        }

        adopted() {
          // fully adopted in tree
          adoptSpy('foo');
        }

        dispose() {
          destructSpy('foo');
        }
      };
      registerComponent(foo);

      const div = createHTML(`
        <div>
          <div data-component="foo">
            foo
          </div>
          <div data-component="foo">
            foo
          </div>
        </div>
      `);

      initComponents(div);

      const items = renderItems<HTMLDivElement>(div, template, [{text: 'foobar'}, {text: 'baz'}]);

      expect(mountSpy).to.have.been.callCount(4);
      expect(adoptSpy).to.have.been.callCount(4);
      expect(items.length).to.equal(2);

      const fooCount = div.querySelectorAll('[data-component="foo"]').length;

      expect(fooCount).to.equal(2);
    });

    it('should append items', () => {

      const compiled:any = new Function('return ' + Handlebars.precompile(fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8')))();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();
      const adoptSpy = spy();
      const destructSpy = spy();

      const foo = class Foo {
        static displayName:string = 'foo';

        constructor() {
          // dom ready
          mountSpy('foo');
        }

        adopted() {
          // fully adopted in tree
          adoptSpy('foo');
        }

        dispose() {
          destructSpy('foo');
        }
      };
      registerComponent(foo);

      const div = createHTML(`
        <div>
          <div data-component="foo">
            foo
          </div>
          <div data-component="foo">
            foo
          </div>
        </div>
      `);

      initComponents(div);

      const items = renderItems<HTMLDivElement>(div, template, [{text: 'foobar'}, {text: 'baz'}], true);

      expect(mountSpy).to.have.been.callCount(4);
      expect(adoptSpy).to.have.been.callCount(4);
      expect(items.length).to.equal(2);

      const fooCount = div.querySelectorAll('[data-component="foo"]').length;

      expect(fooCount).to.equal(4);
    });
  });
});

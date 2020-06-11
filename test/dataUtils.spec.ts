/* eslint-disable max-lines, class-methods-use-this, no-new-func */
import { expect, use } from 'chai';
import Handlebars from 'handlebars';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';
import path from 'path';
import fs from 'fs';
import { renderItem, renderItems } from '../src/lib/utils/dataUtils';

import initComponents from '../src/lib/utils/initComponents';
import { registerComponent } from '../src/lib/utils/componentStore';
import { createHTML, getTestComponentClass } from './helpers';

use(sinonChai);

describe('dataUtils', () => {
  describe('renderItem', () => {
    it('should replace an item', () => {
      const compiled: () => void = new Function(
        `return ${Handlebars.precompile(
          fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8'),
        )}`,
      )();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();
      const adoptSpy = spy();
      const destructSpy = spy();

      const foo = getTestComponentClass('foo', { mountSpy, adoptSpy, destructSpy });
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

      const item = renderItem<HTMLDivElement>(div, template, { text: 'foobar' });

      expect(mountSpy).to.have.been.calledThrice;
      expect(adoptSpy).to.have.been.calledThrice;
      expect(destructSpy).to.have.been.calledTwice;
      expect(item).to.not.be.oneOf([null, undefined, false]);

      const fooCount = div.querySelectorAll('[data-component="foo"]').length;

      expect(fooCount).to.equal(1);
    });

    it('should append an item', () => {
      const compiled: () => void = new Function(
        `return ${Handlebars.precompile(
          fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8'),
        )}`,
      )();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();
      const adoptSpy = spy();
      const destructSpy = spy();

      const foo = getTestComponentClass('foo', { mountSpy, adoptSpy, destructSpy });
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

      const item = renderItem<HTMLDivElement>(div, template, { text: 'foobar' }, true);

      expect(mountSpy).to.have.been.calledThrice;
      expect(adoptSpy).to.have.been.calledThrice;
      expect(destructSpy).to.have.not.been.called;
      expect(item).to.not.be.oneOf([null, undefined, false]);

      const fooCount = div.querySelectorAll('[data-component="foo"]').length;

      expect(fooCount).to.equal(3);
    });
  });

  describe('renderItems', () => {
    it('should replace all items', () => {
      const compiled: () => void = new Function(
        `return ${Handlebars.precompile(
          fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8'),
        )}`,
      )();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();
      const adoptSpy = spy();
      const destructSpy = spy();

      const foo = getTestComponentClass('foo', { mountSpy, adoptSpy, destructSpy });
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

      const items = renderItems<HTMLDivElement>(div, template, [
        { text: 'foobar' },
        { text: 'baz' },
      ]);

      expect(mountSpy).to.have.been.callCount(4);
      expect(adoptSpy).to.have.been.callCount(4);
      expect(destructSpy).to.have.been.callCount(2);
      expect(items.length).to.equal(2);

      const fooCount = div.querySelectorAll('[data-component="foo"]').length;

      expect(fooCount).to.equal(2);
    });

    it('should append items', () => {
      const compiled: () => void = new Function(
        `return ${Handlebars.precompile(
          fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8'),
        )}`,
      )();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();
      const adoptSpy = spy();

      const foo = getTestComponentClass('foo', { mountSpy, adoptSpy });
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

      const items = renderItems<HTMLDivElement>(
        div,
        template,
        [{ text: 'foobar' }, { text: 'baz' }],
        true,
      );

      expect(mountSpy).to.have.been.callCount(4);
      expect(adoptSpy).to.have.been.callCount(4);
      expect(items.length).to.equal(2);

      const fooCount = div.querySelectorAll('[data-component="foo"]').length;

      expect(fooCount).to.equal(4);
    });

    it('should replace all items, each with provided wrapper element', () => {
      const compiled: () => void = new Function(
        `return ${Handlebars.precompile(
          fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8'),
        )}`,
      )();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();
      const destructSpy = spy();

      const foo = getTestComponentClass('foo', { mountSpy, destructSpy });
      registerComponent(foo);

      const div = createHTML(`
        <div>
          <div data-wrapper="bar">
            <div data-component="foo">
              foo
            </div>
          </div>
          <div data-wrapper="bar">
            <div data-component="foo">
              foo
            </div>
          </div>
        </div>
      `);

      initComponents(div);

      const wrapperElement = createHTML('<div data-wrapper="bar"></div>');
      const data = [{ text: 'foobar' }, { text: 'baz' }, { text: 'ipsum' }];

      const items = renderItems<HTMLDivElement>(div, template, data, false, wrapperElement);

      expect(mountSpy).to.have.been.callCount(5);
      expect(destructSpy).to.have.been.callCount(2);
      expect(items.length).to.equal(3);

      const wrapperCount = div.querySelectorAll('[data-wrapper="bar"]').length;

      expect(wrapperCount).to.equal(3);
    });

    it('should append items with provided wrapper element', () => {
      const compiled: () => void = new Function(
        `return ${Handlebars.precompile(
          fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8'),
        )}`,
      )();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();

      const foo = getTestComponentClass('foo', { mountSpy });
      registerComponent(foo);

      const div = createHTML(`
        <div>
          <div data-wrapper="bar">
            <div data-component="foo">
              foo
            </div>
          </div>
          <div data-wrapper="bar">
            <div data-component="foo">
              foo
            </div>
          </div>
        </div>
      `);

      initComponents(div);

      const wrapperElement = createHTML('<div data-wrapper="bar"></div>');
      const data = [{ text: 'foobar' }, { text: 'baz' }, { text: 'ipsum' }];
      const items = renderItems<HTMLDivElement>(div, template, data, true, wrapperElement);

      expect(mountSpy).to.have.been.callCount(5);
      expect(items.length).to.equal(3);

      const wrapperCount = div.querySelectorAll('[data-wrapper="bar"]').length;
      expect(wrapperCount).to.equal(5);
    });

    it('should append items with nested wrapper element', () => {
      const compiled: () => void = new Function(
        `return ${Handlebars.precompile(
          fs.readFileSync(path.resolve(__dirname, './mock/foo.hbs'), 'utf-8'),
        )}`,
      )();
      const template = Handlebars.template(compiled);

      const mountSpy = spy();

      const foo = getTestComponentClass('foo', { mountSpy });
      registerComponent(foo);

      const div = createHTML(`
        <div>
          <div data-wrapper="bar">
            <div data-component="foo">
              foo
            </div>
          </div>
          <div data-wrapper="bar">
            <div data-component="foo">
              foo
            </div>
          </div>
        </div>
      `);

      initComponents(div);

      const wrapperElement = createHTML(`
        <div data-wrapper="bar">
          <span data-wrapper="bar-inner"></span>
        </div>
      `);
      const data = [{ text: 'foobar' }, { text: 'baz' }, { text: 'ipsum' }];
      const items = renderItems<HTMLDivElement>(div, template, data, true, wrapperElement);

      expect(mountSpy).to.have.been.callCount(5);
      expect(items.length).to.equal(3);

      const wrapperElements = div.querySelectorAll('[data-wrapper="bar-inner"]');
      expect(wrapperElements.length).to.equal(3);

      wrapperElements.forEach((element) => {
        const childrenCount = element.children.length;
        expect(childrenCount).to.equal(1);
      });
    });
  });
});

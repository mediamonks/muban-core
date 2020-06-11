// eslint-disable-next-line unicorn/prevent-abbreviations
import { expect, use } from 'chai';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';
import Handlebars from 'handlebars/runtime';

import { createHTML } from './helpers';
import { bootstrap } from '../src/lib/dev';

use(sinonChai);

const createContext = (files) => {
  // tslint:disable-next-line function-name
  function Module(file) {
    return files[file];
  }

  Module.keys = () => Object.keys(files);

  return Module;
};

describe('dev', () => {
  it('should call onData', (done) => {
    const div = createHTML(`
      <div id="app">
        <div data-component="foo">
          foo
          <div data-component="bar">
            Foobar
            <div class="container"></div>
          </div>
        </div>
      </div>
    `);

    const dataContext = createContext({ './home.yaml': { name: 'home-content' } });
    const partialsContext = createContext({ home: () => 'home-partial-content' });

    const onDataSpy = spy();

    bootstrap(div, {
      Handlebars,
      dataContext,
      partialsContext,
      indexTemplate: (data: unknown) => data.toString(),
      appTemplate: (data: unknown) => data.toString(),
      onData: onDataSpy,
      pageName: 'home',
    });
    document.dispatchEvent(new Event('DOMContentLoaded'));

    setTimeout(() => {
      expect(onDataSpy).to.have.been.calledOnce;
      expect(onDataSpy).to.have.been.calledWithMatch({ name: 'home-content' }, 'home');
      done();
    }, 100);
  });

  it('should render index', (done) => {
    const div = createHTML(`
      <div id="app">
        <div data-component="foo">
          foo
          <div data-component="bar">
            Foobar
            <div class="container"></div>
          </div>
        </div>
      </div>
    `);

    const dataContext = createContext({ './home.yaml': { name: 'home-content' } });
    const partialsContext = createContext({ index: () => 'index-partial-content' });

    const onRenderSpy = spy();

    bootstrap(div, {
      Handlebars,
      dataContext,
      partialsContext,
      appTemplate: (data: unknown) => data.toString(),
      indexTemplate: (data: unknown) => {
        onRenderSpy(data);
        return data.toString();
      },
      pageName: 'listing',
    });
    document.dispatchEvent(new Event('DOMContentLoaded'));

    setTimeout(() => {
      expect(onRenderSpy).to.have.been.calledOnce;
      done();
    }, 100);
  });
});

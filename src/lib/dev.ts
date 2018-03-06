/**
 * This file is only used during development.
 * It's set up to render the hbs templates in the DOM using javascript, and supports hot reloading.
 */
import 'modernizr';
import path from 'path';
import cleanElement from './utils/cleanElement';
import initComponents from './utils/initComponents';
import { getChanged, getModuleContext } from './utils/webpackUtils';

let indexTemplate;
let appTemplate;

function createIndexRenderer(appRoot, jsonModules, onInit, onUpdate) {
  return update => {
    appRoot.innerHTML = indexTemplate({
      pages: Object.keys(jsonModules)
        .map(key => ({
          page: path.basename(key, `.${key.split('.').pop()}`),
          data: jsonModules[key],
        }))
        .sort()
        .map(({ page, data }) => ({
          page,
          data,
          link: `${page}.html`,
        })),
    });
    update ? onUpdate && onUpdate() : onInit && onInit();
  };
}

function createPageRenderer(appRoot, jsonModules, pageName, onInit, onUpdate) {
  let initTimeout;
  return update => {
    appRoot.innerHTML = appTemplate(
      jsonModules[`./${pageName}.yaml`] || jsonModules[`./${pageName}.json`],
    );

    // giving the browser some time to inject the styles
    // so when components are constructed, the styles are all applied
    clearTimeout(initTimeout);
    initTimeout = setTimeout(() => {
      initComponents(appRoot);
      update ? onUpdate && onUpdate() : onInit && onInit();
    }, 100);
  };
}

function registerComponent(path, content, options) {
  const map = options.registerPartialMap || [
    path => (path.includes('/block/') ? /\/([^/]+)\.hbs/gi.exec(path)[1] : null),
  ];
  let res;
  map.some(x => {
    if ((res = x(path))) {
      options.Handlebars.registerPartial(res, content);
    }
    // if we have one match, ignore the others, otherwise we might register a component twice
    return !!res;
  });
}

export type BootstrapOptions = {
  indexTemplate: any;
  appTemplate: any;
  dataContext: any;
  partialsContext: any;
  Handlebars: any;
  onInit?: () => void;
  onUpdate?: () => void;
  registerPartialMap?: Array<(path: string) => string | null>;
};

export function bootstrap(appRoot: HTMLElement, options: BootstrapOptions) {
  // Get info for current page
  const pageMatch = /\/(.*)\.html/i.exec(document.location.pathname);
  const pageName = (pageMatch && pageMatch[1]) || 'index';

  indexTemplate = options.indexTemplate;
  appTemplate = options.appTemplate;

  let renderer;

  const update = () => {
    cleanElement(appRoot);
    renderer(true);
  };

  const [jsonModules] = getModuleContext(options.dataContext);
  const [partialModules] = getModuleContext(options.partialsContext, (_, key, module) => {
    registerComponent(key, module, options);
  });

  if (pageName === 'index') {
    renderer = createIndexRenderer(appRoot, jsonModules, options.onInit, options.onUpdate);
  } else {
    renderer = createPageRenderer(appRoot, jsonModules, pageName, options.onInit, options.onUpdate);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderer();
  });

  return {
    updateData(changedContext) {
      const changedModules = getChanged(changedContext, jsonModules);

      // only re-render if the current page data is changed
      if (
        changedModules.some(
          ({ key }) => key === `./${pageName}.yaml` || key === `./${pageName}.json`,
        )
      ) {
        update();
      }
    },

    updatePartials(changedContext) {
      // You can't use the previous context here. You _need_ to call require.context again to
      // get the new version. Otherwise you might get errors about using disposed modules
      const changedModules = getChanged(changedContext, partialModules);

      changedModules.forEach(({ key, content }) => {
        registerComponent(key, content, options);
      });

      update();
    },

    update(updatedIndexTemplate, updatedAppTemplate) {
      indexTemplate = updatedIndexTemplate;
      appTemplate = updatedAppTemplate;

      update();
    },
  };
}

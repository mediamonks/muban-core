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

function createIndexRenderer(appRoot, jsonModules) {
  return () => {
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
  };
}

function createPageRenderer(appRoot, jsonModules, pageName) {
  let initTimeout;
  return () => {
    appRoot.innerHTML = appTemplate(
      jsonModules[`./${pageName}.yaml`] || jsonModules[`./${pageName}.json`],
    );

    // giving the browser some time to inject the styles
    // so when components are constructed, the styles are all applied
    clearTimeout(initTimeout);
    initTimeout = setTimeout(() => initComponents(appRoot), 100);
  };
}

export type BootstrapOptions = {
  indexTemplate: any;
  appTemplate: any;
  dataContext: any;
  dataContextHot: any;
  partialsContext: any;
  Handlebars: any;
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
    renderer();
  };

  const [jsonModules] = getModuleContext(options.dataContext);
  const [partialModules] = getModuleContext(options.partialsContext, (_, key, module) => {
    // only blocks have to be registered, the others are automatically done by the hbs-loader
    if (key.includes('/block/')) {
      options.Handlebars.registerPartial(/\/([^/]+)\.hbs/gi.exec(key)[1], module);
    }
  });

  if (pageName === 'index') {
    renderer = createIndexRenderer(appRoot, jsonModules);
  } else {
    renderer = createPageRenderer(appRoot, jsonModules, pageName);
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
        // register updated partials and re-render the page
        if (key.includes('/block/')) {
          options.Handlebars.registerPartial(/\/([^/]+)\.hbs/gi.exec(key)[1], content);
        }
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

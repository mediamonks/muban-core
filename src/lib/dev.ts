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
    const pages = Object.keys(jsonModules)
      .map(key => {
        const item = {
          page: path.basename(key, `.${key.split('.').pop()}`),
          data: jsonModules[key],
        };
        if (!item.data.meta) {
          item.data.meta = {};
        }
        if (item.page.includes('.')) {
          item.data.meta.alt = true;
        }
        return item;
      })
      .sort((a, b) => {
        if (a.data.meta.alt || b.data.meta.alt) {
          // sort on alt
          if (a.page.startsWith(b.page)) return 1;
          if (b.page.startsWith(a.page)) return -1;
        }
        return String(a.data.meta.id || a.page).localeCompare(String(b.data.meta.id || b.page));
      })
      .map(({ page, data }) => ({
        page,
        data,
        link: `${page}.html`,
      }));

    const categoryMap = pages.reduce((cats, page) => {
      const category = page.data.meta.category || 'default';
      if (!cats[category]) {
        cats[category] = [];
      }
      cats[category].push(page);
      return cats;
    }, {});

    const categories = Object.keys(categoryMap).map(key => ({
      name: key,
      pages: categoryMap[key],
    }));

    appRoot.innerHTML = indexTemplate({
      pages,
      categories,
      showCategories: categories.length > 1,
    });
    initComponents(appRoot);
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

/**
 * This file is only used during development.
 * It's set up to render the hbs templates in the DOM using javascript, and supports hot reloading.
 */
import cleanElement from './utils/cleanElement';
import { getChanged, getModuleContext } from './utils/webpackUtils';
import createIndexRenderer from './dev-utils/createIndexRenderer';
import createPageRenderer, { PageRenderOptions } from './dev-utils/createPageRenderer';
import registerComponent from './dev-utils/registerComponent';

type Renderer = (update?: boolean) => void;
type Template = (data: any) => string;
export type Page = {
  page: string;
  data: any;
  link: string;
};

let indexTemplate;
let appTemplate;

export type BootstrapOptions = Partial<
  Pick<PageRenderOptions, 'onInit' | 'onUpdate' | 'onData' | 'onBeforeInit'>
> & {
  indexTemplate: (data: any) => string;
  appTemplate: (data: any) => string;
  dataContext: any;
  partialsContext: any;
  Handlebars: any;
  registerPartialMap?: Array<(path: string) => string | null>;
  pageName?: string;
};

export function bootstrap(appRoot: HTMLElement, options: BootstrapOptions) {
  // Get info for current page
  let pageName: string;
  if (options.pageName) {
    pageName = options.pageName;
  } else {
    const pageMatch = /\/(.*)\.html/i.exec(document.location.pathname);
    pageName = (pageMatch && pageMatch[1]) || 'listing';
  }

  indexTemplate = options.indexTemplate;
  appTemplate = options.appTemplate;

  let renderer: Renderer;

  const update = () => {
    cleanElement(appRoot);
    renderer(true);
  };

  const [jsonModules] = getModuleContext(options.dataContext);
  const [partialModules] = getModuleContext(options.partialsContext, (_, key, module) => {
    registerComponent(key, module, options);
  });

  const renderOptions = {
    appRoot,
    jsonModules,
    onInit: options.onInit,
    onUpdate: options.onUpdate,
    onBeforeInit: options.onBeforeInit,
  };

  if (pageName === 'listing') {
    // @ts-ignore
    renderer = createIndexRenderer({ ...renderOptions, template: indexTemplate });
  } else {
    renderer = createPageRenderer({
      ...renderOptions,
      pageName,
      template: appTemplate,
      // @ts-ignore
      onData: options.onData,
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderer();
  });

  return {
    // @ts-ignore
    updateData(changedContext: __WebpackModuleApi.RequireContext) {
      const changedModules = getChanged(changedContext, jsonModules);

      // only re-render if the current page data is changed
      if (changedModules.some(({ key }) => new RegExp(`[\\/\\\\]${pageName}\\.`).test(key))) {
        update();
      }
    },

    updatePartials(changedContext: __WebpackModuleApi.RequireContext) {
      // You can't use the previous context here. You _need_ to call require.context again to
      // get the new version. Otherwise you might get errors about using disposed modules
      const changedModules = getChanged(changedContext, partialModules);

      changedModules.forEach(({ key, content }) => {
        registerComponent(key, content, options);
      });

      update();
    },

    update(updatedIndexTemplate: Template, updatedAppTemplate: Template) {
      indexTemplate = updatedIndexTemplate;
      appTemplate = updatedAppTemplate;

      update();
    },
  };
}

import { waitForLoadedStyleSheets } from '../utils/waitForStyleSheetsLoaded';
import initComponents from '../utils/initComponents';
import { IndexRenderOptions } from './createIndexRenderer';

export type PageRenderOptions = IndexRenderOptions & {
  pageName: string;
  onData: (data: object, pageName: string) => object;
};

export default function createPageRenderer({
  appRoot,
  jsonModules,
  template,
  pageName,
  onInit,
  onUpdate,
  onBeforeInit,
  onData,
}: PageRenderOptions) {
  return update => {
    // giving the browser some time to inject the styles
    // so when components are constructed, the styles are all applied
    waitForLoadedStyleSheets(document).then(() => {
      const data = jsonModules[`./${pageName}.yaml`] || jsonModules[`./${pageName}.json`];
      // render page with data
      appRoot.innerHTML = template(onData ? onData(data, pageName) || {} : data);

      if (!update) {
        onBeforeInit && onBeforeInit();
      }

      // init components
      initComponents(appRoot);

      update ? onUpdate && onUpdate() : onInit && onInit();
    });
  };
}

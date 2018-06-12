/**
 * Code being executed on production builds on start
 */
import initComponents from './utils/initComponents';
import { waitForLoadedStyleSheets } from './utils/waitForStyleSheetsLoaded';

export type BootstrapOptions = {
  onInit?: () => void;
  onBeforeInit?: () => void;
};

export function bootstrap(appRoot: HTMLElement, options: BootstrapOptions = {}) {
  document.addEventListener('DOMContentLoaded', () => {
    // most of the time this should already be the case, but to be sure we check if all sheets are loaded
    waitForLoadedStyleSheets(document).then(() => {
      // before initing components, to be compatible with dev mode
      options.onBeforeInit && options.onBeforeInit();

      // Makes the website interactive, all hbs components are already loaded and registered, since they
      // are included in the webpack entry
      initComponents(appRoot);

      options.onInit && options.onInit();
    });
  });
}

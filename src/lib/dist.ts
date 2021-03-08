/**
 * Code being executed on production builds on start
 */
import initComponents from './utils/initComponents';
import { waitForLoadedStyleSheets } from './utils/waitForStyleSheetsLoaded';

export type BootstrapOptions = {
  onInit?: () => void;
  onBeforeInit?: () => void;
};

export async function bootstrap(
  appRoot: HTMLElement,
  options: BootstrapOptions = {},
): Promise<void> {
  await new Promise<void>((resolve) => {
    // Check the readyState to check if it's necessary to listen to the DOMContentLoaded event
    if (document.readyState !== 'loading') {
      resolve();
      return;
    }

    document.addEventListener('DOMContentLoaded', () => resolve());
  });

  // most of the time this should already be the case, but to be sure we check if all sheets are loaded
  await waitForLoadedStyleSheets(document);

  // before initing components, to be compatible with dev mode
  options.onBeforeInit?.();

  // Makes the website interactive, all hbs components are already loaded and registered, since they
  // are included in the webpack entry
  initComponents(appRoot);

  options.onInit?.();
}

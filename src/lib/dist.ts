/**
 * Code being executed on production builds on start
 */
import initComponents from './utils/initComponents';

export function bootstrap(appRoot: HTMLElement) {
  document.addEventListener('DOMContentLoaded', () => {
    // Makes the website interactive, all hbs components are already loaded and registered, since they
    // are included in the webpack entry
    initComponents(appRoot);
  });
}

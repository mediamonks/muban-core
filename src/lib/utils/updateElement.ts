import cleanElement from './cleanElement';
import initComponents from './initComponents';

/**
 * Updates the content of an element, including cleanup and initializing the new components.
 * Useful when you retrieved new HTML from the backend and need to replace a section of the page.
 *
 * @param {HTMLElement} element
 * @param {string} html
 */
export default function updateElement(element: HTMLElement, html: string): void {
  // dispose all created component instances
  cleanElement(element);

  // insert the new HTML into a temp container to construct the DOM
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const newElement = <Node>temp.firstChild;

  // replace the HTML on the page
  if (!element.parentNode) {
    throw new Error('Cannot update element: element not mounted in dom');
  }
  element.parentNode.replaceChild(newElement, element);

  // initialize new components for the new element
  initComponents(<HTMLElement>newElement);
}

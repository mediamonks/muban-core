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
  const temporary = document.createElement('div');
  temporary.innerHTML = html;
  const newElement = temporary.firstChild;

  // replace the HTML on the page
  element.parentNode.replaceChild(newElement, element);

  // initialize new components for the new element
  initComponents(newElement as HTMLElement);
}

import sortBy from 'lodash/sortBy';
import { getComponents, setComponentInstance } from './componentStore';

/**
 * Called to init components for the elements in the DOM.
 *
 * @param {HTMLElement} rootElement
 */
export default function initComponents(rootElement: HTMLElement): void {
  const list = [];

  getComponents().forEach(component => {
    const BlockConstructor = component;
    const displayName = BlockConstructor.displayName;

    if (rootElement.getAttribute('data-component') === displayName) {
      list.push({
        component,
        element: rootElement,
        depth: getComponentDepth(rootElement as HTMLElement),
      });
    }

    // find all DOM elements that belong the this block
    Array.from(rootElement.querySelectorAll(`[data-component="${displayName}"]`)).forEach(
      element => {
        list.push({
          component,
          element,
          depth: getComponentDepth(element as HTMLElement),
        });
      },
    );
  });

  // sort list by deepest element first
  // this will make sure that child components are constructed
  // before any parents, allowing the parents to directly reference them
  const sortedList = sortBy(list, ['depth']).reverse();

  // create all corresponding classes
  sortedList.forEach(({ component, element }) => {
    const BlockConstructor = component;
    const displayName = BlockConstructor.displayName;

    // we don't want an error in one component to stop creating all other components
    try {
      const instance = new BlockConstructor(element);
      setComponentInstance(displayName, { instance, element });
    } catch (e) {
      // tslint:disable-next-line no-console
      console.error(e);
    }
  });
}

/**
 * Returns the depth of an element in the DOM
 *
 * @param {HTMLElement} element
 * @return {number}
 */
function getComponentDepth(element: HTMLElement): number {
  let depth = 0;
  let el = element;
  while (el.parentElement) {
    ++depth;
    el = el.parentElement;
  }
  return depth;
}

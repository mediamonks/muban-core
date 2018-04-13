import { getComponentInstances, hasComponentInstance } from './componentStore';
import ICoreComponent from '../interface/ICoreComponent';

/**
 * Given a DOM element, retrieve the attached class instance
 *
 * When component classes are created, a reference to them, along with the element,
 * are stored. This method can be used to retrieve them.
 *
 * This can be useful when using querySelectors to select child DOM elements,
 * and you want to communicate with the attached code, e.g. listen to events,
 * read properties or call functions on them.
 *
 * @param {HTMLElement} element
 * @return {CoreComponent}
 */
export default function getComponentForElement<T extends ICoreComponent = ICoreComponent>(
  element: HTMLElement,
): T {
  const displayName = element.getAttribute('data-component');

  if (displayName && hasComponentInstance(displayName)) {
    return (<any>(getComponentInstances(displayName).find(b => b.element === element) || {}))
      .instance;
  }

  return null;
}

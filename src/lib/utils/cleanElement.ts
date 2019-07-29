import { hasComponentInstance, removeComponentByElement } from './componentStore';

/**
 * Remove all instances bound to this html element or its children.
 *
 * Finds all elements with a data-component attribute, and disposes and removes the created
 * component instance for that element.
 *
 * You should call this function before removing/replacing any piece of HTML that has components
 * attached to it (e.g. when calling initComponents on replaced HTML)
 *
 * @param {HTMLElement} element
 */
export default function cleanElement(element: HTMLElement): void {
  const displayName = element.getAttribute('data-component');

  // find instance linked to element and clean up
  if (displayName && hasComponentInstance(displayName)) {
    const removedComponent = removeComponentByElement(displayName, element);
    if (removedComponent && removedComponent.instance && removedComponent.instance.dispose) {
      removedComponent.instance.dispose();
    }
  }

  // call recursively on all child data-components
  Array.from(element.querySelectorAll('[data-component]')).forEach(cleanElement);
}

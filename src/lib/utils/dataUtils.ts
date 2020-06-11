import cleanElement from './cleanElement';
import initComponents from './initComponents';

export function renderItem<T extends Element = HTMLElement>(
  container: HTMLElement,
  template: (data?: Record<string, unknown>) => string,
  data: Record<string, unknown>,
  append: boolean = false,
): T {
  return render<T>(container, append, () => createHtml(template(data)))[0];
}

export function renderItems<T extends Element = HTMLElement>(
  container: HTMLElement,
  template: (data?: Record<string, unknown>) => string,
  data: Array<Record<string, unknown>>,
  append: boolean = false,
  listElementWrapper?: HTMLElement,
) {
  let generateStringTemplate: () => HTMLElement | DocumentFragment;
  if (listElementWrapper) {
    generateStringTemplate = () => {
      return data.reduce<DocumentFragment>((temporaryContainer, d) => {
        const templateHtml = createHtml(
          template(d),
          (listElementWrapper as HTMLElement).cloneNode(true) as HTMLElement,
        );
        temporaryContainer.appendChild(templateHtml);
        return temporaryContainer;
      }, document.createDocumentFragment());
    };
  } else {
    generateStringTemplate = () => {
      const innerHtml = data.reduce((html, d) => html + template(d), '');
      return createHtml(innerHtml);
    };
  }
  return render<T>(container, append, generateStringTemplate);
}

function createHtml(innerHtml: string, container?: HTMLElement) {
  const div = container || document.createElement('div');
  appendToDeepestNode(innerHtml, div);
  return div;
}

function appendToDeepestNode(innerHtml: string, element: HTMLElement): HTMLElement {
  if (!element.firstElementChild) {
    // eslint-disable-next-line no-param-reassign
    element.innerHTML = innerHtml;
    return element;
  }
  return appendToDeepestNode(innerHtml, element.firstElementChild as HTMLElement);
}

function render<T extends Element = HTMLElement>(
  container: HTMLElement,
  append: boolean,
  getHtml: () => HTMLElement | DocumentFragment,
): Array<T> {
  if (!append) {
    // dispose all created component instances
    cleanElement(container);
    while (container.children.length) {
      container.children[0].remove();
    }
  }
  const fragment = document.createDocumentFragment();
  const children = Array.from<T>((getHtml().children as unknown) as Array<T>);

  children.forEach((child) => fragment.appendChild(child));

  container.appendChild(fragment);

  if (append) {
    // only init the newly added component(s)
    // TODO: Element (T) cannot be cast to HTMLElement (from initComponents)
    children.forEach((child) => initComponents((child as unknown) as HTMLElement));
  } else {
    // initialize new components for the new element
    initComponents(container);
  }

  return children;
}

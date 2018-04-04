import cleanElement from './cleanElement';
import initComponents from './initComponents';

export function renderItem(
  container: HTMLElement,
  template: (data?: any) => string,
  data: any,
  append: boolean = false,
) {
  render(container, append, () => template(data));
}

export function renderItems(
  container: HTMLElement,
  template: (data?: any) => string,
  data: Array<any>,
  append: boolean = false,
) {
  render(container, append, () => data.reduce((html, d) => html + template(d), ''));
}

function render(container: HTMLElement, append: boolean, getHtml: () => string) {
  if (!append) {
    // dispose all created component instances
    cleanElement(container);
    while (container.children.length) {
      container.removeChild(container.children[0]);
    }
  }

  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.innerHTML = getHtml();

  const children = Array.from(div.children);
  for (const child of children) {
    fragment.appendChild(child);
  }

  container.appendChild(fragment);

  if (append) {
    // only init the newly added component(s)
    for (const child of children) {
      initComponents(<HTMLElement>child);
    }
  } else {
    // initialize new components for the new element
    initComponents(container);
  }
}

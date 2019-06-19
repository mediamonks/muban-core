import cleanElement from './cleanElement';
import initComponents from './initComponents';

export function renderItem<T extends Element = HTMLElement>(
  container: HTMLElement,
  template: (data?: any) => string,
  data: any,
  append: boolean = false,
): T {
  return render<T>(container, append, () => createHtml(template(data)))[0];
}

export function renderItems<T extends Element = HTMLElement>(
  container: HTMLElement,
  template: (data?: any) => string,
  data: Array<any>,
  append: boolean = false,
  listElementWrapper?: HTMLElement,
) {
  let generateStringTemplate;
  if (listElementWrapper) {
    generateStringTemplate = () => {
      return data.reduce((html, d) => {
        const templateHtml = createHtml(template(d), <HTMLElement>listElementWrapper.cloneNode(
          true,
        ));
        html.appendChild(templateHtml);
        return html;
      }, document.createElement('div'));
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
  const div = container ? container : document.createElement('div');
  div.innerHTML = innerHtml;
  return div;
}

function render<T extends Element = HTMLElement>(
  container: HTMLElement,
  append: boolean,
  getHtml: () => HTMLElement,
): Array<T> {
  if (!append) {
    // dispose all created component instances
    cleanElement(container);
    while (container.children.length) {
      container.removeChild(container.children[0]);
    }
  }
  const fragment = document.createDocumentFragment();
  const children = <Array<T>>Array.from(getHtml().children);

  for (const child of children) {
    fragment.appendChild(child);
  }

  container.appendChild(fragment);

  if (append) {
    // only init the newly added component(s)
    for (const child of children) {
      // TODO: Element (T) cannot be cast to HTMLElement (from initComponents)
      initComponents(<HTMLElement>(<any>child));
    }
  } else {
    // initialize new components for the new element
    initComponents(container);
  }

  return children;
}

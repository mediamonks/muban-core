import path from 'path';
import { waitForLoadedStyleSheets } from '../utils/waitForStyleSheetsLoaded';
import initComponents from '../utils/initComponents';

export type IndexRenderOptions = {
  appRoot: HTMLElement;
  template: (data: Record<string, unknown>) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonModules: Record<string, Record<string, any>>;
  onInit: () => void;
  onUpdate: () => void;
  onBeforeInit: () => void;
};

export default function createIndexRenderer({
  appRoot,
  template,
  jsonModules,
  onInit,
  onUpdate,
  onBeforeInit,
}: IndexRenderOptions) {
  return (update) => {
    const pages = getPages(jsonModules);

    const categoryMap = mapCategories(pages);

    const categories = Object.keys(categoryMap).map((key) => ({
      name: key,
      pages: categoryMap[key],
    }));

    waitForLoadedStyleSheets(document, true).then(() => {
      // eslint-disable-next-line no-param-reassign
      appRoot.innerHTML = template({
        pages,
        categories,
        showCategories: categories.length > 1,
      });

      if (!update) {
        onBeforeInit?.();
      }

      initComponents(appRoot);

      (update ? onUpdate : onInit)?.();
    });
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPages(jsonModules: { [key: string]: Record<string, any> }) {
  return Object.keys(jsonModules)
    .map((key) => {
      const item = {
        page: path.basename(key, `.${key.split('.').pop()}`),
        data: jsonModules[key],
      };
      // execute when exported as js function
      if (typeof item.data === 'function') {
        item.data = item.data();
      }

      if (!item.data.meta) {
        item.data.meta = {};
      }
      if (item.page.includes('.')) {
        item.data.meta.alt = true;
      }
      return item;
    })
    .sort((a, b) => {
      if (a.data.meta.alt || b.data.meta.alt) {
        // sort on alt
        if (a.page.startsWith(b.page)) {
          return 1;
        }
        if (b.page.startsWith(a.page)) {
          return -1;
        }
      }
      return String(a.data.meta.id || a.page).localeCompare(String(b.data.meta.id || b.page));
    })
    .map(({ page, data }) => ({
      page,
      data,
      link: `${page}.html`,
    }));
}

function mapCategories(pages) {
  return pages.reduce((cats, page) => {
    const category = page.data.meta.category || 'default';
    const categoryList = cats[category] || [];
    categoryList.push(page);
    return { ...cats, [category]: categoryList };
  }, {});
}

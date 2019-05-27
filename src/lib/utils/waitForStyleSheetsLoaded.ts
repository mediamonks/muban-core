/**
 * Waits until all css files are loaded before continuing
 *
 * @param document - the html document
 * @param dev - if in dev mode, it will only check 'blob' urls that are injected by style loaders
 */
export const waitForLoadedStyleSheets = (document, dev = false) =>
  new Promise(resolve => {
    const links = <Array<HTMLLinkElement>>Array.from<HTMLLinkElement>(
      document.querySelectorAll('link[rel=stylesheet]'),
    ).filter(l => !dev || (l.href && l.href.startsWith('blob:')));

    let allLoaded = false;
    let loadedCount = 0;
    const checkAllLoaded = (initial = false) => {
      const sheets = Array.from<StyleSheet>(document.styleSheets).filter(
        s => !dev || (s.href && s.href.startsWith('blob:')),
      );

      // initially, check stylesheets in the DOM, otherwise, check loaded count
      if (
        !allLoaded &&
        ((initial && sheets.length >= links.length) || (!initial && loadedCount >= links.length))
      ) {
        allLoaded = true;
        resolve();
      }
    };

    checkAllLoaded(true);

    if (!allLoaded) {
      links.forEach(stylesheet => {
        stylesheet.onload = () => {
          ++loadedCount;
          checkAllLoaded();
        };
      });
    }
  });

export const waitForLoadedStyleSheets = (document: Document) =>
  new Promise(resolve => {
    const links = <Array<HTMLLinkElement>>Array.from(
      document.querySelectorAll('link[rel=stylesheet]'),
    );

    let allLoaded = false;
    const checkAllLoaded = () => {
      if (!allLoaded && document.styleSheets.length >= links.length) {
        allLoaded = true;
        resolve();
      }
    };
    checkAllLoaded();

    if (!allLoaded) {
      links.forEach(stylesheet => {
        stylesheet.onload = () => {
          checkAllLoaded();
        };
      });
    }
  });

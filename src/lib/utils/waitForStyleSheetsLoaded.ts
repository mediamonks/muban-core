/**
 * Waits until all css files are loaded before continuing
 *
 * @param document - the html document
 * @param dev - if in dev mode, it will only check 'blob' urls that are injected by style loaders
 */
export const waitForLoadedStyleSheets = (document, development = false) =>
  new Promise((resolve) => {
    const links = Array.from<HTMLLinkElement>(
      // eslint-disable-next-line no-restricted-properties
      document.querySelectorAll('link[rel=stylesheet]'),
    ).filter((l) => !development || (l.href && l.href.startsWith('blob:')));

    // console.info('[WFSSL]');
    // console.info('[WFSSL] ---- init ----');
    // console.info('[WFSSL] links: ', links.length);
    // console.info('[WFSSL] links: \n\t', links.map(l => `${l.href} -- ${l.href.substr(-3)} - ${l.sheet}`).join('\n\t '));

    let resolved = false;

    const checkAllLoaded = () => {
      if (resolved) return;

      const allLoaded = links.every((l) => !!l.sheet);

      // console.info('[WFSSL]');
      // console.info('[WFSSL] ---- check ----');
      // console.info('[WFSSL] check: allLoaded: ', allLoaded);

      if (allLoaded) {
        resolved = true;
        resolve();
      }
    };

    // initial check
    checkAllLoaded();

    if (!resolved) {
      links.forEach((stylesheet) => {
        // eslint-disable-next-line no-param-reassign
        stylesheet.onload = () => {
          // const ss:StyleSheet = event.target as any as StyleSheet;
          // console.info('[WFSSL]');
          // console.info('[WFSSL] ---- onLoad ----');
          // console.info('[WFSSL] onLoad', `${ss.href} -- ${ss.href.substr(-3)} [${links.map(l => l.href).indexOf(ss.href)}]`);

          checkAllLoaded();
        };
      });
    }
  });

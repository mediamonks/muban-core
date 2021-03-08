/**
 * Waits until all css files are loaded before continuing
 *
 * @param document - the html document
 * @param dev - if in dev mode, it will only check 'blob' urls that are injected by style loaders
 */
export const waitForLoadedStyleSheets = (document: Document, development = false): Promise<void> =>
  new Promise<void>((resolve) => {
    const links = Array.from<HTMLLinkElement>(
      // eslint-disable-next-line no-restricted-properties
      document.querySelectorAll('link[rel=stylesheet]'),
    )
      // Some sheets get injected (by extensions) that don't have a source set,
      // those sheets will get the same source as the page, but will never load
      .filter((l) => l.href !== document.location.href)
      // during development, we want to ignore blob-sheets, as they behave weird and will load instantly anyway
      .filter((l) => !development || (l.href && l.href.startsWith('blob:')));

    // console.info('[WFSSL]');
    // console.info('[WFSSL] ---- init ----');
    // console.info('[WFSSL] links: ', links.length);
    // console.info('[WFSSL] loaded: \n\t', links.map(l => `${l.href} -- ${l.sheet}`).join('\n\t '));
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

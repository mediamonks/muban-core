/**
 * Waits until all css files are loaded before continuing
 *
 * @param document - the html document
 * @param dev - if in dev mode, it will only check 'blob' urls that are injected by style loaders
 */
export const waitForLoadedStyleSheets = (document: Document, dev = false) =>
  new Promise(resolve => {
    const links = <Array<HTMLLinkElement>>Array.from<HTMLLinkElement>(
      document.querySelectorAll('link[rel=stylesheet]'),
    ).filter(l => !dev || (l.href && l.href.startsWith('blob:')));

    // tslint:disable:no-console
    // console.info('[WFSSL]');
    // console.info('[WFSSL] ---- init ----');
    // console.info('[WFSSL] links: ', links.length);
    // console.info('[WFSSL] links: \n\t', links.map(l => `${l.href} -- ${l.href.substr(-3)} - ${l.sheet}`).join('\n\t '));
    // tslint:enable:no-console

    let resolved = false;

    const checkAllLoaded = () => {
      if (resolved) return;

      const allLoaded = links.every(l => !!l.sheet);

      // tslint:disable:no-console
      // console.info('[WFSSL]');
      // console.info('[WFSSL] ---- check ----');
      // console.info('[WFSSL] check: allLoaded: ', allLoaded);
      // tslint:enable:no-console

      if (allLoaded) {
        resolved = true;
        resolve();
      }
    };

    // initial check
    checkAllLoaded();

    if (!resolved) {
      links.forEach(stylesheet => {
        stylesheet.onload = () => {
          // tslint:disable:no-console
          // const ss:StyleSheet = event.target as any as StyleSheet;
          // console.info('[WFSSL]');
          // console.info('[WFSSL] ---- onLoad ----');
          // console.info('[WFSSL] onLoad', `${ss.href} -- ${ss.href.substr(-3)} [${links.map(l => l.href).indexOf(ss.href)}]`);
          // tslint:enable:no-console

          checkAllLoaded();
        };
      });
    }
  });

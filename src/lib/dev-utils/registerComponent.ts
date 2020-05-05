export default function registerComponent(path: string, content: any, options: any) {
  const map = options.registerPartialMap || [
    // @ts-ignore
    (path: any) => (path.includes('/block/') ? /\/([^/]+)\.hbs/gi.exec(path)[1] : null),
  ];
  let res;
  map.some((x: any) => {
    if ((res = x(path))) {
      options.Handlebars.registerPartial(res, content);
    }
    // if we have one match, ignore the others, otherwise we might register a component twice
    return !!res;
  });
}

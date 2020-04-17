export default function registerComponent(path, content, options) {
  const map = options.registerPartialMap || [
    path => (path.includes('/block/') ? /\/([^/]+)\.hbs/gi.exec(path)[1] : null),
  ];
  let res;
  map.some(x => {
    if ((res = x(path))) {
      options.Handlebars.registerPartial(res, content);
    }
    // if we have one match, ignore the others, otherwise we might register a component twice
    return !!res;
  });
}

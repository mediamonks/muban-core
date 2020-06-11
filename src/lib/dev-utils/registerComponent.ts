export default function registerComponent(path, content, options) {
  const map = options.registerPartialMap || [
    (p) => (p.includes('/block/') ? /\/([^/]+)\.hbs/gi.exec(p)[1] : null),
  ];
  let response;
  map.some((x) => {
    response = x(path);
    if (response) {
      options.Handlebars.registerPartial(response, content);
    }
    // if we have one match, ignore the others, otherwise we might register a component twice
    return !!response;
  });
}

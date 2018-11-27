const path = require('path');

/**
 * Adds html comments around the partial so it's easily findable
 */
export default function(this: any, content) {
  // tslint:disable-next-line no-this-assignment
  const loaderContext = this;

  const done = this.async();
  this.cacheable();

  loaderContext.resolve(loaderContext.context, loaderContext.resourcePath, (_, partialName) => {
    // try to match anything after the last /src/ path, and optionally strip/match /app/ as well
    const commonSourceMatch = partialName.match(/.*src[\\/](?:app[\\/])?(.+?)$/);
    let shortPartialName;
    if (commonSourceMatch) {
      shortPartialName = commonSourceMatch[1].replace(/[/\\]/g, '/');
    } else {
      // if above match nog found, take path relative to the webpack project context
      shortPartialName = path.relative(loaderContext.context, partialName);
    }

    const newContent = `
<!-- partial: ${shortPartialName} -->
${content.replace(/\s+$/, '')}
<!-- / ${shortPartialName} -->
`;

    done(null, newContent);
  });
}

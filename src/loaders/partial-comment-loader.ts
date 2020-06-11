import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoaderContext = any;

/**
 * Adds html comments around the partial so it's easily findable
 */
export default function (this: LoaderContext, content: string) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
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

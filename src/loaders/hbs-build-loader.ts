import loaderUtils from 'loader-utils';
import webpack from 'webpack';

/**
 * Processes handlebar templates to import script and style files.
 * Also has an option to remove al the template code itself to only extract the scripts out of it
 *
 * For scripts:
 * - Changes the html script include to a js file require
 * - Also registers the class to be initialized
 * - Has support for hot reloading
 *
 * For styles:
 * - Changes the html style link to a css file require
 */
export default function(this: webpack.loader.LoaderContext, content: string) {
  // tslint:disable-next-line no-this-assignment
  const loaderContext = this;

  const done = this.async()!;
  this.cacheable();

  const options = loaderUtils.getOptions(this);
  let removeTemplate;
  const { removeScript = false, removeStyle = false, hot = true } = options;

  const includeTemplateInBuild = /\?.*include/.test(loaderContext.resourceQuery);

  if (includeTemplateInBuild) {
    removeTemplate = false;
  } else {
    removeTemplate = options.removeTemplate || false;
  }

  // extract script and style includes, and remove them from the content
  const { scripts, styles, content: strippedContent } = extractIncludes(content);

  let newContent = '';

  newContent = processScripts(scripts, { loaderContext, removeScript, hot }) + newContent;
  newContent = processStyles(styles, { loaderContext, removeStyle }) + newContent;

  newContent += processTemplate(strippedContent, { removeTemplate }, includeTemplateInBuild);

  done(null, newContent);
}

function extractIncludes(content: string) {
  const scripts: Array<string> = [];
  const styles: Array<string> = [];

  let strippedContent = content.replace(
    /<script src=\\["']([^"']+)\\["']><\/script>[\\r\\n]*/gi,
    (_, match) => {
      scripts.push(match);
      return '';
    },
  );

  strippedContent = strippedContent.replace(
    /<link rel=\\["']stylesheet\\["'] href=\\["']([^"']+)\\["']>[\\r\\n]*/gi,
    (_, match) => {
      styles.push(match);
      return '';
    },
  );

  return {
    scripts,
    styles,
    content: strippedContent,
  };
}

interface ProcessScriptsOptions {
  loaderContext: webpack.loader.LoaderContext;
  removeScript: boolean;
  hot: boolean;
}

function processScripts(
  scripts: Array<string>,
  { loaderContext, removeScript, hot }: ProcessScriptsOptions,
) {
  if (removeScript || !scripts.length) {
    return '';
  }

  return `
${scripts
    .map(
      script => `
var component = require(${loaderUtils.stringifyRequest(loaderContext, script)}).default;
var registerComponent = require('muban-core').registerComponent;
registerComponent(component);
${
        hot
          ? `
// Hot Module Replacement API
if (module.hot) {
  module.hot.accept(${loaderUtils.stringifyRequest(loaderContext, script)}, function() {
    var component = require(${loaderUtils.stringifyRequest(loaderContext, script)}).default;
    require('muban-core').updateComponent(component);
  });
}`
          : ''
      }
`,
    )
    .join('\n')}

`;
}

interface ProcessStylesOptions {
  loaderContext: webpack.loader.LoaderContext;
  removeStyle: boolean;
}

function processStyles(
  styles: Array<string>,
  { loaderContext, removeStyle }: ProcessStylesOptions,
) {
  if (removeStyle || !styles.length) {
    return '';
  }

  return `
${styles.map(style => `require(${loaderUtils.stringifyRequest(loaderContext, style)});`).join('\n')}
`;
}

interface ProcessTemplateOptions {
  removeTemplate: boolean;
}

function processTemplate(
  content: string,
  { removeTemplate }: ProcessTemplateOptions,
  includeTemplateInBuild: boolean,
) {
  if (!removeTemplate) {
    if (includeTemplateInBuild) {
      return content.replace(/require\("([\w/\\. -]+.hbs)"\)/gi, 'require("$1?include")');
    }
    return content;
  }
  // only keep requires from original template
  return `
// hbs partial requires
${content
    .split(/(require\("[^"]+"\))/gim) // grab all requires
    .filter((r, i) => i % 2 === 1 && r.endsWith('.hbs")')) // only pick require items, and keep hbs
    .join('\n')}`;
}

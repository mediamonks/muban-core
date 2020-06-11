import { expect } from 'chai';
import Memoryfs from 'memory-fs';
import requireFromString from 'require-from-string';
import fs from 'fs';
import path from 'path';
import compiler from './compiler';

function getOutput(stats) {
  if (stats.toJson().errors.length > 0) {
    // eslint-disable-next-line no-console
    console.error(stats.toJson().errors);
  }

  return stats.toJson().modules[0].source;
}

async function compile(file: string, resultPostfix: string) {
  const outputFs = new Memoryfs();
  const expected = fs
    .readFileSync(path.resolve(__dirname, `_fixtures/${file}-${resultPostfix}.hbs`), 'utf-8')
    .replace(/\\n/gi, '\n');

  const stats = await compiler(outputFs, `_fixtures/${file}.hbs`, [
    {
      test: /\.hbs/,
      use: [
        {
          loader: 'raw-loader',
        },
        {
          loader: path.resolve(__dirname, '../src/loaders/partial-comment-loader.ts'),
        },
      ],
    },
  ]);

  getOutput(stats);

  const fileContent = outputFs
    .readFileSync(path.resolve(__dirname, './output/bundle.js'))
    .toString();
  const actual = requireFromString(fileContent);

  return {
    actual,
    expected,
  };
}

describe('loader', () => {
  it('should append a basic comment', async () => {
    const { expected, actual } = await compile('empty/button', 'comment');
    expect(expected).to.deep.equal(actual);
  }).timeout(10000);

  it('should append a comment in muban/src', async () => {
    const { expected, actual } = await compile('muban/src/button', 'comment');
    expect(expected).to.deep.equal(actual);
  }).timeout(10000);

  it('should append a comment in muban/src/app', async () => {
    const { expected, actual } = await compile('muban/src/app/button', 'comment');
    expect(expected).to.deep.equal(actual);
  }).timeout(10000);

  it('should append a comment in muban/src/app/button', async () => {
    const { expected, actual } = await compile('muban/src/app/button/button', 'comment');
    expect(expected).to.deep.equal(actual);
  }).timeout(10000);

  it('should append a comment in nested/src/muban/src', async () => {
    const { expected, actual } = await compile('nested/src/muban/src/button', 'comment');
    expect(expected).to.deep.equal(actual);
  }).timeout(10000);

  it('should append a comment in nested/src/muban/src/app', async () => {
    const { expected, actual } = await compile('nested/src/muban/src/app/button', 'comment');
    expect(expected).to.deep.equal(actual);
  }).timeout(10000);

  it('should append a comment in nested/src/muban/src/app/button', async () => {
    const { expected, actual } = await compile('nested/src/muban/src/app/button/button', 'comment');
    expect(expected).to.deep.equal(actual);
  }).timeout(10000);
});

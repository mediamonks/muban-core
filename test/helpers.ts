/* eslint-disable chai-friendly/no-unused-expressions */
import * as Sinon from 'sinon';

export function createHTML(content) {
  const div = document.createElement('div');
  div.innerHTML = content;
  return div.firstElementChild as HTMLElement;
}

export type ComponentSpies = {
  mountSpy?: Sinon.SinonSpy;
  adoptSpy?: Sinon.SinonSpy;
  destructSpy?: Sinon.SinonSpy;
};

export function getTestComponentClass(
  displayName: string,
  { mountSpy, adoptSpy, destructSpy }: ComponentSpies,
) {
  return class MubanComponent {
    public static displayName: string = displayName;

    public constructor() {
      // dom ready
      mountSpy?.(displayName);
    }

    // eslint-disable-next-line class-methods-use-this
    public adopted() {
      // fully adopted in tree
      adoptSpy?.(displayName);
    }

    // eslint-disable-next-line class-methods-use-this
    public dispose() {
      destructSpy?.(displayName);
    }
  };
}

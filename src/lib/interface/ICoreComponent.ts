import IDisposable from 'seng-disposable/lib/IDisposable';

interface ICoreComponent extends IDisposable {
  readonly element: HTMLElement;

  /**
   * @public
   * @method getElement
   * @param {string} selector
   * @param {HTMLElement} container
   * @returns {HTMLElement}
   */
  getElement<T extends Element = HTMLElement>(selector: string, container?: HTMLElement): T | null;

  /**
   * @public
   * @method getElements
   * @param {string} selector
   * @param {HTMLElement} container
   * @returns {Array<HTMLElement>}
   */
  getElements<T extends Element = HTMLElement>(
    selector: string,
    container?: HTMLElement,
  ): ReadonlyArray<T>;
}

export default ICoreComponent;

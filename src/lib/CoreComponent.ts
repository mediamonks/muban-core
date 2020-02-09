import Disposable from 'seng-disposable/lib/Disposable';
import ICoreComponent from './interface/ICoreComponent';

export default class CoreComponent extends Disposable implements ICoreComponent {
  public element: HTMLElement;

  constructor(element: HTMLElement) {
    super();
    this.element = element;
  }

  /**
   * @public
   * @method getElement
   * @param {string} selector
   * @param {HTMLElement} container
   * @returns {HTMLElement}
   */
  public getElement<T extends Element = HTMLElement>(
    selector: string,
    container: HTMLElement = this.element,
  ): T | null {
    return container.querySelector(selector);
  }

  /**
   * @public
   * @method getElements
   * @param {string} selector
   * @param {HTMLElement} container
   * @returns {Array<HTMLElement>}
   */
  public getElements<T extends Element = HTMLElement>(
    selector: string,
    container: HTMLElement = this.element,
  ): Array<T> {
    return Array.from(container.querySelectorAll(selector));
  }

  dispose() {
    this.element = null;

    super.dispose();
  }
}

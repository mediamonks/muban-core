export default class CoreComponent {
  protected data: { [key: string]: string };
  protected element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /**
   * @public
   * @method getElement
   * @param {string} selector
   * @param {HTMLElement} container
   * @returns {HTMLElement}
   */
  public getElement(selector: string, container: HTMLElement = this.element): HTMLElement {
    return <HTMLElement>container.querySelector(selector);
  }

  /**
   * @public
   * @method getElements
   * @param {string} selector
   * @param {HTMLElement} container
   * @returns {Array<HTMLElement>}
   */
  public getElements(selector: string, container: HTMLElement = this.element): Array<HTMLElement> {
    return <Array<HTMLElement>>Array.from(container.querySelectorAll(selector));
  }

  dispose() {
    this.element = null;
    this.data = null;
  }
}

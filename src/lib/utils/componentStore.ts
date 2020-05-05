import ICoreComponent from '../interface/ICoreComponent';

export type StoredComponentInstance = {
  instance: any;
  element: HTMLElement;
};

export type ComponentModule = {
  displayName: string;
  new (element: HTMLElement): ICoreComponent;
};

/***********************************************
 * Store components and instanced on the Window,
 * because webpack can't re-use the same module
 * between different entry files.
 *
 * Maybe there is a better way to 'globally'
 * share info between entries
 */
export type ComponentInstances = {
  [key: string]: Array<StoredComponentInstance>;
};
export type ComponentModules = Array<ComponentModule>;

// store instances
const componentInstances: ComponentInstances = {};

// store constructors
let componentModules: ComponentModules = [];

declare global {
  interface Window {
    __muban_core__: {
      store: {
        componentInstances: ComponentInstances;
        componentModules: ComponentModules;
      };
    };
  }
}

if (typeof window !== 'undefined') {
  window.__muban_core__ = window.__muban_core__ || {};
  window.__muban_core__.store = window.__muban_core__.store || {
    componentInstances,
    componentModules,
  };
}

function getLocalComponentInstances(): ComponentInstances {
  if (typeof window !== 'undefined') {
    return window.__muban_core__.store.componentInstances;
  }
  return componentInstances;
}

function getLocalComponentModules(): ComponentModules {
  if (typeof window !== 'undefined') {
    return window.__muban_core__.store.componentModules;
  }
  return componentModules;
}

function setLocalComponentModules(modules: ComponentModules): void {
  if (typeof window !== 'undefined') {
    window.__muban_core__.store.componentModules = modules;
  } else {
    componentModules = modules;
  }
}

/*
 * End global storage hack
 ************************/

/**
 * Registers a component class to be initialized later for each DOM element matching the
 * displayName.
 *
 * Called by code that is added by the hbs-build-loader
 *
 * @param component A reference to the component constructor function
 */
export function registerComponent(component: ComponentModule) {
  if (component.displayName) {
    // remove old instance before adding the new one
    setLocalComponentModules(
      getLocalComponentModules().filter(c => c.displayName !== component.displayName),
    );
    getLocalComponentModules().push(component);
  } else {
    // tslint:disable-next-line no-console
    console.error('missing "block" definition on component', component);
  }
}

/**
 * Used for hot reloading, is called when a new version of a component class is called.
 *
 * Called by code that is added by the hbs-build-loader
 *
 * @param component A reference to the component constructor function
 */
export function updateComponent(component: ComponentModule): void {
  const BlockConstructor = component;
  const displayName = BlockConstructor.displayName;

  // cleanup and recreate all block instances
  getComponentInstances(displayName).forEach(c => {
    c.instance.dispose && c.instance.dispose();
    c.instance = new BlockConstructor(c.element);
  });
}

export function getComponents(): Array<ComponentModule> {
  return getLocalComponentModules();
}

export function getComponentInstances(displayName: string): Array<StoredComponentInstance> {
  return getLocalComponentInstances()[displayName] || [];
}

export function hasComponentInstance(displayName: string): boolean {
  return displayName in getLocalComponentInstances();
}

export function setComponentInstance(
  displayName: string,
  component: StoredComponentInstance,
): void {
  if (!getLocalComponentInstances()[displayName]) {
    getLocalComponentInstances()[displayName] = [];
  }

  getLocalComponentInstances()[displayName].push(component);
}

export function removeComponentByElement(
  displayName: string,
  element: HTMLElement,
): StoredComponentInstance | null {
  const itemIndex = getComponentInstances(displayName).findIndex(c => c.element === element);
  if (itemIndex !== -1) {
    return getLocalComponentInstances()[displayName].splice(itemIndex, 1)[0];
  }
  return null;
}

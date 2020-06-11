export type StoredComponentInstance = {
  instance: { dispose?: () => void };
  element: HTMLElement;
};

export type ComponentModule = {
  displayName: string;
};

/** *********************************************
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

const MUBAN_CORE_GLOBAL_NAMESPACE = '__muban_core__';

declare global {
  interface Window {
    [MUBAN_CORE_GLOBAL_NAMESPACE]: {
      store?: {
        componentInstances?: ComponentInstances;
        componentModules?: ComponentModules;
      };
    };
  }
}

if (typeof window !== 'undefined') {
  window[MUBAN_CORE_GLOBAL_NAMESPACE] = window[MUBAN_CORE_GLOBAL_NAMESPACE] || {};
  window[MUBAN_CORE_GLOBAL_NAMESPACE].store = window[MUBAN_CORE_GLOBAL_NAMESPACE].store || {
    componentInstances,
    componentModules,
  };
}

function getLocalComponentInstances(): ComponentInstances {
  if (typeof window !== 'undefined') {
    return window[MUBAN_CORE_GLOBAL_NAMESPACE].store.componentInstances;
  }
  return componentInstances;
}

function getLocalComponentModules(): ComponentModules {
  if (typeof window !== 'undefined') {
    return window[MUBAN_CORE_GLOBAL_NAMESPACE].store.componentModules;
  }
  return componentModules;
}

function setLocalComponentModules(modules: ComponentModules): void {
  if (typeof window !== 'undefined') {
    window[MUBAN_CORE_GLOBAL_NAMESPACE].store.componentModules = modules;
  } else {
    componentModules = modules;
  }
}

/*
 * End global storage hack
 *********************** */

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
      getLocalComponentModules().filter((c) => c.displayName !== component.displayName),
    );
    getLocalComponentModules().push(component);
  } else {
    // eslint-disable-next-line no-console
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
export function updateComponent(component): void {
  const BlockConstructor = component;
  const { displayName } = BlockConstructor;

  // cleanup and recreate all block instances
  getComponentInstances(displayName).forEach((c) => {
    c.instance.dispose?.();
    // eslint-disable-next-line no-param-reassign
    c.instance = new BlockConstructor(c.element);
  });
}

export function getComponents(): Array<ComponentModule> {
  return getLocalComponentModules();
}

export function getComponentInstances(displayName: string): Array<StoredComponentInstance> {
  return getLocalComponentInstances()[displayName] || [];
}

export function hasComponentInstances(displayName: string): boolean {
  return displayName in getLocalComponentInstances();
}

/**
 * Returns the component instance (JS class + element) for a given element
 */
export function getComponentInstance(element: HTMLElement): StoredComponentInstance | null {
  const displayName = element.dataset.component;
  const instances = getComponentInstances(displayName);
  return instances.find((instance) => instance.element === element) ?? null;
}

/**
 * Returns true of the passed element has a component instance created for it
 */
export function hasComponentInstance(element: HTMLElement): boolean {
  const displayName = element.dataset.component;
  const instances = getComponentInstances(displayName);
  return instances.some((instance) => instance.element === element);
}

export function setComponentInstance(
  displayName: string,
  component: StoredComponentInstance,
): void {
  const instances = getLocalComponentInstances();
  if (!instances[displayName]) {
    instances[displayName] = [];
  }

  instances[displayName].push(component);
}

export function removeComponentByElement(
  displayName: string,
  element: HTMLElement,
): StoredComponentInstance {
  const itemIndex = getComponentInstances(displayName).findIndex((c) => c.element === element);
  if (itemIndex !== -1) {
    return getLocalComponentInstances()[displayName].splice(itemIndex, 1)[0];
  }
  return null;
}

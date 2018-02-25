export type StoredComponentInstance = {
  instance: any;
  element: HTMLElement;
};

export type ComponentModule = {
  displayName: string;
};

// store instances
const componentInstances: {
  [key: string]: Array<StoredComponentInstance>;
} = {};

// store constructors
let componentModules: Array<ComponentModule> = [];

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
    componentModules = componentModules.filter(c => c.displayName !== component.displayName);
    componentModules.push(component);
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
export function updateComponent(component): void {
  const BlockConstructor = component;
  const displayName = BlockConstructor.displayName;

  // cleanup and recreate all block instances
  getComponentInstances(displayName).forEach(c => {
    c.instance.dispose && c.instance.dispose();
    c.instance = new BlockConstructor(c.element);
  });
}

export function getComponents(): Array<ComponentModule> {
  return componentModules;
}

export function getComponentInstances(displayName: string): Array<StoredComponentInstance> {
  return componentInstances[displayName] || [];
}

export function hasComponentInstance(displayName: string): boolean {
  return displayName in componentInstances;
}

export function setComponentInstance(
  displayName: string,
  component: StoredComponentInstance,
): void {
  if (!componentInstances[displayName]) {
    componentInstances[displayName] = [];
  }

  componentInstances[displayName].push(component);
}

export function removeComponentByElement(
  displayName: string,
  element: HTMLElement,
): StoredComponentInstance {
  const itemIndex = getComponentInstances(displayName).findIndex(c => c.element === element);
  if (itemIndex !== -1) {
    return componentInstances[displayName].splice(itemIndex, 1)[0];
  }
  return null;
}

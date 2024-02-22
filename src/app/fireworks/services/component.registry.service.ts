import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComponentRegistryService {

  private _registry: { [key: string]: any } = {};

  constructor() {

  }


  register(key, sidebar): void {
    // Check if the key already being used
    if (this._registry[key]) {
      // console.error(`The component with the key '${key}' already exists. Either unregister it first or use a unique key.`);

      return;
    }

    // Add to the registry
    this._registry[key] = sidebar;
  }

  unregister(key): void {
    // Check if the sidebar exists
    if (!this._registry[key]) {
      console.warn(`The sidebar with the key '${key}' doesn't exist in the registry.`);
    }

    // Unregister the sidebar
    delete this._registry[key];
  }


  getComponent<T>(key: string): T {
    // Check if the sidebar exists
    if (!this._registry[key]) {
      console.warn(`The sidebar with the key '${key}' doesn't exist in the registry.`);

      return;
    }
    // Return the sidebar
    return this._registry[key] as T;
  }
}

import {AsyncLocalStorage} from 'async_hooks';

/**
 * Create global storage
 */
const globalStorage: any = {};

/**
 * Create async local storage
 */
const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Get the storage for the current context
 */
export const getStorage = () => asyncLocalStorage.getStore() || globalStorage;

/**
 * Set up the context and execute the process
 * @param callback The process to be executed after the context is set up
 */

export const executeWithContext = (callback: () => void): void =>
  asyncLocalStorage.run({}, callback);

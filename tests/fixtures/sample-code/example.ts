/**
 * Sample code file for testing
 */

/**
 * Search for items in an array
 */
export function searchItems(items: string[], query: string): string[] {
  return items.filter(item => item.includes(query));
}

/**
 * User class
 */
export class User {
  constructor(public name: string, public email: string) {}
  
  /**
   * Get user info
   */
  getInfo(): string {
    return `${this.name} (${this.email})`;
  }
}

/**
 * Search configuration interface
 */
export interface SearchConfig {
  maxResults: number;
  timeout: number;
  enableCache: boolean;
}

import { RuntimeVariable } from './variable';

/**
 * Table Item
 */
export interface TableItem {
  /**
   * Selected
   *
   * @type {boolean}
   */
  selected: boolean;

  /**
   * Value
   *
   * @type {string}
   */
  value: string;

  /**
   * Show Status
   *
   * @type {boolean}
   */
  showStatus: boolean;

  /**
   * Status Color
   *
   * @type {string}
   */
  statusColor?: string;

  /**
   * Sub Items
   */
  children?: TableItem[];

  /**
   * Variable
   */
  variable?: RuntimeVariable;

  /**
   * All Child Values
   */
  childValues?: string[];
}

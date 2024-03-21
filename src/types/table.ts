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
   * Selectable
   *
   * @type {boolean}
   */
  selectable?: boolean;

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
   * Status
   *
   * @type {number}
   */
  status?: number;

  /**
   * Sub Items
   *
   * @type {TableItem[]}
   */
  children?: TableItem[];

  /**
   * Variable
   *
   * @type {RuntimeVariable}
   */
  variable?: RuntimeVariable;

  /**
   * All Child Values
   *
   * @type {string[]}
   */
  childValues?: string[];

  /**
   * Child Selected Count
   *
   * @type {number}
   */
  childSelectedCount?: number;

  /**
   * Can be added to favorites
   *
   * @type {boolean}
   */
  canBeFavorite?: boolean;

  /**
   * Is Favorite
   *
   * @type {boolean}
   */
  isFavorite?: boolean;

  /**
   * Child Favorites Count
   *
   * @type {number}
   */
  childFavoritesCount?: number;

  /**
   * Name
   *
   * @type {string}
   */
  name?: string;

  /**
   * Label
   *
   * @type {string}
   */
  label: string;
}

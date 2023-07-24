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

  /**
   * Can be added to favorites
   */
  canBeFavorite?: boolean;

  /**
   * Is Favorite
   */
  isFavorite?: boolean;

  /**
   * Child Favorites Count
   */
  childFavoritesCount?: number;

  /**
   * Name
   */
  name?: string;
}

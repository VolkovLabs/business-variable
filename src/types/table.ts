/**
 * Table Item
 */
export interface TableItem {
  /**
   * Text
   *
   * @type {string}
   */
  text: string;

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
}

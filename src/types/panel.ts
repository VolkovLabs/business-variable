/**
 * Group Level
 */
export interface GroupLevel {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Data Frame Id
   */
  source: string;
}

/**
 * Options
 */
export interface PanelOptions {
  /**
   * Variable
   *
   * @type {string}
   */
  variable: string;

  /**
   * Field name for variable values
   *
   * @type {string}
   */
  name: string;

  /**
   * Field name for status values
   *
   * @type {string}
   */
  status: string;

  /**
   * Tree View Levels
   */
  levels: GroupLevel[];

  /**
   * Show Header
   */
  showHeader: boolean;
}

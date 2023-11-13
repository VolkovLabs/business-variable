/**
 * Display Mode
 */
export enum DisplayMode {
  MINIMIZE = 'minimize',
  TABLE = 'table',
  BUTTON = 'button',
}

/**
 * Level
 */
export interface Level {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Data Frame ID or Frame Index if no specified
   */
  source: string | number;
}

/**
 * Levels Group
 */
export interface LevelsGroup {
  /**
   * Name
   *
   * @type {string}
   */
  name: string;

  /**
   * Items
   *
   * @type {Level[]}
   */

  items: Level[];
}

/**
 * Table View Options
 */
export interface TableViewOptions {
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
   * Tree View Level Groups
   */
  groups: LevelsGroup[];

  /**
   * Display Header
   */
  header: boolean;

  /**
   * Use Sticky position
   */
  sticky: boolean;

  /**
   * Values Filter
   */
  filter: boolean;

  /**
   * Always Visible Filter
   */
  alwaysVisibleFilter: boolean;

  /**
   * Select Favorites
   */
  favorites: boolean;

  /**
   * Show Variable Names
   */
  showName: boolean;

  /**
   * Auto Scroll
   */
  autoScroll: boolean;

  /**
   * Status Sort
   */
  statusSort: boolean;
}

/**
 * Options
 * Extends for backward compatibility
 */
export interface PanelOptions extends TableViewOptions {
  /**
   * Display Mode
   */
  displayMode: DisplayMode;

  /**
   * Variable
   *
   * @type {string}
   */
  variable: string;

  /**
   * Padding
   *
   * @type {number}
   */
  padding: number;

  /**
   * Empty Value
   */
  emptyValue: boolean;

  /**
   * Group Selection
   */
  groupSelection: boolean;

  /**
   * Dashboard Variable
   *
   * @type {string}
   */
  dashboardVariable: string;
}

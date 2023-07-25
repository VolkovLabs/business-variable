/**
 * Display Mode
 */
export enum DisplayMode {
  MINIMIZE = 'minimize',
  TABLE = 'table',
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
   * Data Frame Id
   */
  source: string;
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
 * Minimize View Options
 */
export interface MinimizeViewOptions {
  /**
   * Variable
   *
   * @type {string}
   */
  variable: string;
}

/**
 * Table View Options
 */
export interface TableViewOptions {
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
   * Minimize View Options
   */
  minimizeView?: MinimizeViewOptions;
}

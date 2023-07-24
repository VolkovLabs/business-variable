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
   * Display Mode
   */
  displayMode: DisplayMode;
}

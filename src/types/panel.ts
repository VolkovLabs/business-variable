import { BusEventBase } from '@grafana/data';

/**
 * Display Mode
 */
export enum DisplayMode {
  MINIMIZE = 'minimize',
  TABLE = 'table',
  BUTTON = 'button',
  SLIDER = 'slider',
}

/**
 * Data Source Config
 */
export interface DatasourceConfig {
  /**
   * Data Source
   *
   * @type {string}
   */
  datasource: string;

  /**
   * Query
   *
   * @type {unknown}
   */
  query: unknown;
}

/**
 * Favorites Storage
 */
export enum FavoritesStorage {
  BROWSER = 'browser',
  DATASOURCE = 'datasource',
}

/**
 * Data Source Query
 */
type DatasourceQuery = Record<string, unknown>;

/**
 * Favorites Config
 */
export interface FavoritesConfig {
  /**
   * Enabled
   *
   * @type {boolean}
   */
  enabled: boolean;

  /**
   * Storage
   *
   * @type {FavoritesStorage}
   */
  storage: FavoritesStorage;

  /**
   * Data Source
   *
   * @type {string}
   */
  datasource: string;

  /**
   * Get Query
   *
   * @type {DatasourceQuery}
   */
  getQuery: DatasourceQuery;

  /**
   * Add Query
   *
   * @type {DatasourceQuery}
   */
  addQuery: DatasourceQuery;

  /**
   * Delete Query
   *
   * @type {DatasourceQuery}
   */
  deleteQuery: DatasourceQuery;
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
   *
   * @type {LevelsGroup[]}
   */
  groups: LevelsGroup[];

  /**
   * Display Header
   *
   * @type {boolean}
   */
  header: boolean;

  /**
   * Use Sticky position
   *
   * @type {boolean}
   */
  sticky: boolean;

  /**
   * Values Filter
   *
   * @type {boolean}
   */
  filter: boolean;

  /**
   * Always Visible Filter
   *
   * @type {boolean}
   */
  alwaysVisibleFilter: boolean;

  /**
   * Favorites
   *
   * @type {boolean}
   */
  favorites: FavoritesConfig;

  /**
   * Save Selected Group
   *
   * @type {boolean}
   */
  saveSelectedGroup: boolean;

  /**
   * Show Variable Names
   *
   * @type {boolean}
   */
  showName: boolean;

  /**
   * Auto Scroll
   *
   * @type {boolean}
   */
  autoScroll: boolean;

  /**
   * Status Sort
   *
   * @type {boolean}
   */
  statusSort: boolean;

  /**
   * Collapsed by default
   *
   * @type {boolean}
   */
  collapsedByDefault: boolean;
}

/**
 * Options
 * Extends for backward compatibility
 */
export interface PanelOptions extends TableViewOptions {
  /**
   * Display Mode
   *
   * @type {DisplayMode}
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
   *
   * @type {boolean}
   */
  emptyValue: boolean;

  /**
   * Custom Value
   *
   * @type {boolean}
   */
  customValue: boolean;

  /**
   * Group Selection
   *
   * @type {boolean}
   */
  groupSelection: boolean;

  /**
   * Dashboard Variable
   *
   * @type {string}
   */
  dashboardVariable: string;

  /**
   * Persistent
   *
   * @type {boolean}
   */
  persistent: boolean;

  /**
   * Show Label
   *
   * @type {boolean}
   */
  showLabel: boolean;

  /**
   * Save Selected Group Key
   *
   * @type {string}
   */
  saveSelectedGroupKey: string;

  /**
   * Reset variable
   *
   * @type {string}
   */
  resetVariable: string;

  /**
   * Label width
   *
   * @type {number}
   */
  labelWidth: number;

  /**
   * Show group total
   *
   * @type {boolean}
   */
  showGroupTotal: boolean;

  /**
   * Show total
   *
   * @type {boolean}
   */
  showTotal: boolean;

  /**
   * Maximum visible values
   *
   * @type {number}
   */
  maxVisibleValues: number;

  /**
   * Show reset button
   *
   * @type {boolean}
   */
  showResetButton: boolean;

  /**
   * Tabs in order
   *
   * @type {boolean}
   */
  tabsInOrder: boolean;
}

/**
 * Recursive Partial
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<RecursivePartial<U>>
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

/**
 * Variable Changed Event
 */
export class VariableChangedEvent extends BusEventBase {
  static type = 'variable-changed';
}

/**
 * Status Style Mode
 */
export enum StatusStyleMode {
  COLOR = 'color',
  IMAGE = 'image',
}

/**
 * Status Style Threshold
 */
export interface StatusStyleThreshold {
  /**
   * Value
   *
   * @type {number}
   */
  value: number;

  /**
   * Image
   *
   * @type {string}
   */
  image: string;
}

/**
 * Status Style Options
 */
export interface StatusStyleOptions {
  /**
   * Mode
   *
   * @type {StatusStyleMode}
   */
  mode: StatusStyleMode;

  /**
   * Thresholds
   *
   * @type {StatusStyleThreshold}
   */
  thresholds: StatusStyleThreshold[];
}

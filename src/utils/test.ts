import { DisplayMode, FavoritesConfig, FavoritesStorage, MinimizeOutputFormat, PanelOptions } from '../types';

/**
 * Create Favorites Config
 * @param config
 */
export const createFavoritesConfig = (config: Partial<FavoritesConfig> = {}): FavoritesConfig => ({
  enabled: false,
  storage: FavoritesStorage.BROWSER,
  datasource: '',
  addQuery: {},
  getQuery: {},
  deleteQuery: {},
  ...config,
});

/**
 * Create Panel Options
 * @param options
 */
export const createPanelOptions = (options: Partial<PanelOptions> = {}): PanelOptions => ({
  dashboardVariable: '',
  displayMode: DisplayMode.TABLE,
  variable: '',
  padding: 0,
  header: false,
  emptyValue: false,
  customValue: false,
  groupSelection: false,
  groups: [],
  persistent: false,
  saveSelectedGroup: false,
  showResetButton: false,
  saveSelectedGroupKey: '',
  resetVariable: '',
  labelWidth: 0,
  showLabel: false,
  showGroupTotal: false,
  showName: false,
  showTotal: false,
  maxVisibleValues: 0,
  name: '',
  status: '',
  alwaysVisibleFilter: false,
  sticky: false,
  filter: false,
  favorites: createFavoritesConfig(),
  autoScroll: false,
  statusSort: false,
  collapsedByDefault: false,
  tabsInOrder: false,
  minimizeOutputFormat: MinimizeOutputFormat.TEXT,
  isUseLocalTime: false,
  browserTabNamePattern: '',
  isMinimizeForTable: false,
  alertCustomMessage: '',
  selectedValues: {
    showSelected: false,
    maxCount: 0,
  },
  ...options,
});

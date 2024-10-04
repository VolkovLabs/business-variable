import { SelectableValue } from '@grafana/data';

import { DateTimeFormat, DisplayMode, FavoritesStorage, MinimizeDisplayMode } from '../types';

/**
 * Display Mode Options
 */
export const DISPLAY_MODE_OPTIONS = [
  { value: DisplayMode.TABLE, label: 'Table', description: 'Full featured table view.' },
  { value: DisplayMode.MINIMIZE, label: 'Minimize', description: 'Minimized select view.' },
  { value: DisplayMode.BUTTON, label: 'Button', description: 'Button select view.' },
  { value: DisplayMode.SLIDER, label: 'Slider', description: 'Slider select view.' },
];

/**
 * Minimize Display Mode Options
 */
export const MINIMIZE_DISPLAY_MODE_OPTIONS = [
  { value: MinimizeDisplayMode.TEXT, label: 'Text Input' },
  { value: MinimizeDisplayMode.DATE_TIME_PICKER, label: 'Date Time Picker' },
];

/**
 * Header Options
 */
export const HEADER_OPTIONS = [
  { value: true, label: 'Display', description: 'Display variable Label or Id. Allows to enable filtering.' },
  { value: false, label: 'Hide', description: 'Do not display header.' },
];

/**
 * Sticky Position
 */
export const STICKY_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Follow when scrolling.' },
  { value: false, label: 'Disabled', description: 'Scroll with dashboard.' },
];

/**
 * Filter Options
 */
export const FILTER_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Display Table Filter.', icon: 'filter' },
  { value: false, label: 'Disabled', description: 'Hide Table Filter.' },
];

/**
 * Always Visible Filter
 */
export const ALWAYS_VISIBLE_FILTER_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Always Visible Search.' },
  { value: false, label: 'Disabled', description: 'Toggleable Search Visibility.' },
];

/**
 * Favorites Enabled Options
 */
export const FAVORITES_ENABLED_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Allows selecting and filtering favorites.', icon: 'favorite' },
  { value: false, label: 'Disabled', description: 'Hide favorites.' },
];

/**
 * Favorites Storage Options
 */
export const FAVORITES_STORAGE_OPTIONS = [
  {
    value: FavoritesStorage.BROWSER,
    label: 'Browser',
    description: 'Saved in the browser storage for each user.',
    icon: 'monitor',
  },
  {
    value: FavoritesStorage.DATASOURCE,
    label: 'Data Source',
    description: 'Saved data with the selected data source.',
    icon: 'database',
  },
];

/**
 * Selected Group Options
 */
export const SELECTED_GROUP_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Allows saving selected group.', icon: 'save' },
  { value: false, label: 'Disabled', description: 'Disables saving selected group.' },
];

/**
 * Status Sort Options
 */
export const STATUS_SORT_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Allows sort by status.' },
  { value: false, label: 'Disabled', description: 'Hide sorting.' },
];

/**
 * Show Name Options
 */
export const SHOW_NAME_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Display variable names.' },
  { value: false, label: 'Disabled', description: 'Hide variable names.' },
];

/**
 * Tabs order Options
 */
export const TABS_ORDER_OPTIONS = [
  { value: true, label: 'In order', description: 'Display tabs in order' },
  { value: false, label: 'Selected first', description: 'Keep selected tab first' },
];

/**
 * Collapse By Default Options
 */
export const COLLAPSED_BY_DEFAULT_OPTIONS = [
  { value: true, label: 'Collapsed', description: 'All levels are collapsed.', icon: 'folder' },
  { value: false, label: 'Expanded', description: 'All levels are expanded.', icon: 'folder-open' },
];

/**
 * Auto Scroll Options
 */
export const AUTO_SCROLL_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Auto scroll to the first selected value.' },
  { value: false, label: 'Disabled', description: 'Disable auto scroll.' },
];

/**
 * Group Selection Options
 */
export const GROUP_SELECTION_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Enable to allow multi-level selection.', icon: 'toggle-on' },
  { value: false, label: 'Disabled', description: 'Disable multi-level selection.', icon: 'toggle-off' },
];

/**
 * Allow Empty Value Options
 */
export const ALLOW_EMPTY_VALUE_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Empty value enabled.' },
  { value: false, label: 'Disabled', description: 'Empty value disabled.' },
];

/**
 * Persistent Options
 */
export const PERSISTENT_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Persistence enabled.' },
  { value: false, label: 'Disabled', description: 'Persistence disabled.' },
];

/**
 * Show label Options
 */
export const SHOW_LABEL_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Show labels enabled.' },
  { value: false, label: 'Disabled', description: 'Show labels disabled.' },
];

/**
 * Allow Custom Value Options
 */
export const ALLOW_CUSTOM_VALUE_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Custom values enabled.' },
  { value: false, label: 'Disabled', description: 'Custom values disabled.' },
];

/**
 * Row Count Options
 */
export const ROW_COUNT_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Display selected rows' },
  { value: false, label: 'Disabled', description: 'Hide selected rows.' },
];

/**
 * Show reset button on button view
 */
export const SHOW_RESET_BUTTON_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Show reset button.' },
  { value: false, label: 'Disabled', description: 'Do not show reset button.' },
];

/**
 * Time Transformation Options
 */
export const TIME_TRANSFORMATION_OPTIONS: SelectableValue[] = [
  {
    description: 'UTC',
    label: 'UTC',
    value: false,
  },
  {
    description: 'Local',
    label: 'Local',
    value: true,
  },
];

/**
 * Date Time format Options
 */
export const DATE_TIME_FORMAT_OPTIONS = [
  { value: DateTimeFormat.ISO_STRING, label: 'ISO String' },
  { value: DateTimeFormat.TIMESTAMP, label: 'Timestamp' },
];
/**
 * Auto Save timeout ms
 */
export const AUTO_SAVE_TIMEOUT = 1000;

/**
 * Favorites Key
 */
export const FAVORITES_KEY = 'volkovlabs.variable.panel.favorites';

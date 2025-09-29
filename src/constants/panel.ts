import { SelectableValue } from '@grafana/data';

import {
  BreakOption,
  DisplayMode,
  FavoritesStorage,
  MinimizeOutputFormat,
  RequestLatencyMode,
  TableViewPosition,
  ToolbarMode,
} from '../types';

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
 * Minimize Output Format Options
 */
export const MINIMIZE_OUTPUT_FORMAT_OPTIONS = [
  { value: MinimizeOutputFormat.TEXT, label: 'Text' },
  { value: MinimizeOutputFormat.DATETIME, label: 'ISO string' },
  { value: MinimizeOutputFormat.TIMESTAMP, label: 'Timestamp' },
  { value: MinimizeOutputFormat.DATE, label: 'Date only' },
];

/**
 * Header Options
 */
export const HEADER_OPTIONS = [
  { value: true, label: 'Display', description: 'Display variable Label or Id. Allows to enable filtering.' },
  { value: false, label: 'Hide', description: 'Do not display header.' },
];

/**
 * Sticky Position Options
 */
export const STICKY_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Follow when scrolling.' },
  { value: false, label: 'Disabled', description: 'Scroll with dashboard.' },
];

/**
 * Table view position options
 */
export const TABLE_VIEW_POSITION_OPTIONS = [
  {
    value: TableViewPosition.NORMAL,
    label: 'Normal',
    description: 'Scroll with dashboard and displayed in the panel.',
  },
  {
    value: TableViewPosition.STICKY,
    label: 'Sticky',
    description: 'Variables will follow when scrolling. Scroll with dashboard.',
  },
  {
    value: TableViewPosition.MINIMIZE,
    label: 'Minimize',
    description: 'Variables shows in drawer by click',
  },
  { value: TableViewPosition.DOCKED, label: 'Docked', description: 'The tree view is displayed in the docked menu.' },
];

/**
 * Auto Scroll Options
 */
export const AUTO_SCROLL_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Auto scroll to the first selected value.' },
  { value: false, label: 'Disabled', description: 'Disable auto scroll.' },
];

/**
 * Table Minimize Options
 */
export const TABLE_MINIMIZE_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Show the table in minimized view. The tree view opens in a drawer.' },
  { value: false, label: 'Disabled', description: 'Show tree view in the panel.' },
];

/**
 * Table Wrap Options
 */
export const TABLE_WRAP_OPTIONS = [
  { value: BreakOption.WORD, label: 'Word', description: 'Break value by words.' },
  { value: BreakOption.NORMAL, label: 'Normal', description: 'Use the default line break rule.' },
  { value: BreakOption.SYMBOL, label: 'Symbol', description: 'Break between any two characters.' },
];

/**
 * Pin/Unpin Options
 */
export const PIN_TAB_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Enable pin/unpin functionality.' },
  { value: false, label: 'Disabled', description: 'Disable pin/unpin functionality.' },
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
 * Show selected values
 */
export const SHOW_SELECTED_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Show button in header', icon: 'eye' },
  { value: false, label: 'Disabled', description: 'Hide Button in header.', icon: 'eye-slash' },
];

/**
 * Toolbar mode options
 */
export const TOOLBAR_MODE_OPTIONS = [
  { value: ToolbarMode.TABS, label: 'Tabs' },
  { value: ToolbarMode.SELECT, label: 'Select' },
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
 * Request latency options
 */
export const REQUEST_LATENCY_OPTIONS = [
  {
    value: RequestLatencyMode.LOW,
    label: 'Low',
    description: 'Default latency 2.5 seconds',
  },
  {
    value: RequestLatencyMode.NORMAL,
    label: 'Normal',
    description: 'Increased latency 10 seconds',
  },
  {
    value: RequestLatencyMode.HIGH,
    label: 'High',
    description: 'High latency 30 seconds',
  },
  {
    value: RequestLatencyMode.UNSTABLE,
    label: 'Unstable',
    description: 'Long-running latency 60 seconds',
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
 * Auto Save timeout ms
 */
export const AUTO_SAVE_TIMEOUT = 1000;

/**
 * Favorites Key
 */
export const FAVORITES_KEY = 'volkovlabs.variable.panel.favorites';

/**
 * No variable default message
 */
export const NO_VARIABLE_DEFAULT_MESSAGE = `Variable is not selected. Constant, Data Source, Interval, AD hoc filters are not supported.`;

/**
 * Options are not available message
 */
export const OPTIONS_NOT_AVAILABLE_MESSAGE = `Options are not available.`;

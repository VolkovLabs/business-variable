import { DisplayMode } from '../types';

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
 * Favorites Options
 */
export const FAVORITES_OPTIONS = [
  { value: true, label: 'Enabled', description: 'Allows selecting and filtering favorites.', icon: 'favorite' },
  { value: false, label: 'Disabled', description: 'Hide favorites.' },
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

import { selectors } from '@grafana/e2e-selectors';
import { createSelector } from '@volkovlabs/jest-selectors';

/**
 * Test Identifiers
 */
export const TEST_IDS = {
  tableView: {
    content: 'data-testid panel content',
    root: 'data-testid panel',
    dockedIcon: createSelector('data-testid docked-icon'),
    buttonCloseDrawer: selectors.components.Drawer.General.close,
    outsideElement: 'data-testid outside-element',
  },
  tableErrorMessage: {
    infoMessage: 'data-testid table-error-message info',
    noDataMessage: 'data-testid table-error-message no-data-message',
  },
  tableMinimizeView: {
    buttonOpenDrawer: 'data-testid table-minimize-view button open-drawer',
    buttonOpenDrawerCustomIcon: 'data-testid table-minimize-view open-drawer-custom-icon',
  },
  toggleDockMenuButtons: {
    root: createSelector('data-testid toggle-dock-menu-buttons'),
    buttonOption: createSelector((name: unknown) => `toggle-dock-menu button-option option-${name}`),
  },
  tableToolbar: {
    root: createSelector('data-testid table-toolbar root'),
    tab: createSelector((name: unknown) => `data-testid table-toolbar tab-${name}`),
    pinButton: createSelector((groupName: unknown) => `data-testid table-toolbar pin-button-${groupName}`),
    fieldSelectGroup: 'field-select-group',
  },
  table: {
    allControl: 'data-testid table all-control',
    body: 'data-testid table body',
    buttonExpand: 'data-testid table button-expand',
    buttonExpandAll: 'data-testid table button-expand-all',
    buttonFilter: 'data-testid table button-filter',
    buttonSort: 'data-testid table button-sort',
    row: (id: string | number) => `data-testid table row-${id}`,
    cell: (value: string, depth: number) => `data-testid table cell-${depth}-${value}`,
    control: 'data-testid table value-control',
    favoritesControl: 'data-testid table favorites-control',
    favoritesFilter: 'data-testid table favorites-filter',
    selectedFilter: 'data-testid table selected-filter',
    fieldFilterValue: 'data-testid table field-filter-value',
    buttonCleanFilterValue: 'data-testid table button-clean-filter-value',
    header: 'data-testid table header',
    headerGroupCount: 'data-testid table header-group-count',
    groupCount: (value: string) => `data-testid table group-count-${value}`,
    label: 'data-testid table label',
    statusColor: 'data-testid table status-color',
    statusImage: 'data-testid table status-image',
  },
  drawerTable: {
    root: 'data-testid drawer-table root container',
  },
  groupsEditor: {
    buttonAddNew: 'data-testid fields-editor button-add-new',
    buttonRemove: 'data-testid fields-editor button-remove',
    buttonStartRename: 'data-testid fields-editor button-start-rename',
    buttonCancelRename: 'data-testid fields-editor button-cancel-rename',
    buttonSaveRename: 'data-testid fields-editor button-save-rename',
    rowErrorMessage: (name: string) => `data-testid fields-editor row-error-message-${name}`,
    fieldErrorMessage: (name: string) => `data-testid fields-editor field-error-message-${name}`,
    fieldName: 'data-testid fields-editor field-name',
    item: (name: string) => `data-testid fields-editor item-${name}`,
    newItem: 'data-testid fields-editor new-level',
    newItemName: 'data-testid fields-editor new-item-name',
  },
  levelsEditor: {
    buttonAddNew: 'data-testid levels-editor button-add-new',
    buttonRemove: 'data-testid levels-editor button-remove',
    item: (name: string) => `data-testid levels-editor item-${name}`,
    newItem: 'data-testid levels-editor new-item',
    newItemName: 'data-testidd levels-editor new-item-name',
    root: 'data-testid levels-editor',
  },
  minimizeView: {
    root: 'data-testid minimize-view',
    noVariableMessage: 'data-testid minimize-view no-variable-message',
  },
  optionsVariable: {
    root: 'options-variable',
  },
  textVariable: {
    root: 'data-testid text-variable',
  },
  dateTimePicker: {
    root: 'data-testid date-time-picker',
  },
  datePicker: {
    root: 'data-testid date-picker',
  },
  buttonView: {
    root: 'data-testid button-view',
    noVariableMessage: 'data-testid button-view no-variable-message',
    noOptionsMessage: 'data-testid button-view no-options-message',
    item: (value: string) => `data-testid button-view item-${value}`,
    resetVariable: 'data-testid button-view reset-variable',
    label: 'data-testid button-view label',
  },
  sliderView: {
    noVariableMessage: 'data-testid slider-view no-variable-message',
    noOptionsMessage: 'data-testid slider-view no-options-message',
    noAvailableOptionsMessage: 'data-testid slider-view no-available-options-message',
    field: 'data-testid slider-view field',
    slider: 'data-testid slider-view slider',
    root: 'data-testid slider-view',
  },
  statusStyleEditor: {
    fieldMode: 'status-style-editor',
    buttonAddItem: 'data-testid status-style-editor button-add-item',
    item: (value: unknown) => `data-testid status-style-editor item-${value}`,
    fieldValue: 'data-testid status-style-editor item field-value',
    fieldUrl: 'data-testid status-style-editor item field-url',
    buttonRemoveItem: 'data-testid status-style-editor item button-remove-item',
  },
  datasourceEditor: {
    fieldSelect: 'select-datasource-editor field-select',
  },
  payloadEditor: {
    loadingMessage: 'data-testid payload-editor loading-message',
    errorMessage: 'data-testid payload-editor error-message',
  },
};

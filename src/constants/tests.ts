/**
 * Test Identifiers
 */
export const TEST_IDS = {
  tableView: {
    content: 'data-testid panel content',
    infoMessage: 'data-testid panel info',
    root: 'data-testid panel',
    tab: (name: string) => `data-testid panel tab-${name}`,
  },
  table: {
    buttonExpand: 'data-testid table button-expand',
    buttonExpandAll: 'data-testid table button-expand-all',
    buttonFilter: 'data-testid table button-filter',
    buttonSort: 'data-testid table button-sort',
    row: (id: string) => `data-testid table row-${id}`,
    cell: (value: string, depth: number) => `data-testid table cell-${depth}-${value}`,
    control: 'data-testid table value-control',
    allControl: 'data-testid table all-control',
    favoritesControl: 'data-testid table favorites-control',
    favoritesFilter: 'data-testid table favorites-filter',
    fieldFilterValue: 'data-testid table field-filter-value',
    buttonCleanFilterValue: 'data-testid table button-clean-filter-value',
    header: 'data-testid table header',
    headerGroupCount: 'data-testid table header-group-count',
    groupCount: (value: string) => `data-testid table group-count-${value}`,
    label: 'data-testid table label',
  },
  groupsEditor: {
    buttonAddNew: 'data-testid fields-editor button-add-new',
    buttonRemove: 'data-testid fields-editor button-remove',
    buttonStartRename: 'data-testid fields-editor button-start-rename',
    buttonCancelRename: 'data-testid fields-editor button-cancel-rename',
    buttonSaveRename: 'data-testid fields-editor button-save-rename',
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
    option: (name: string) => `options-variable option-${name}`,
  },
  textVariable: {
    root: 'data-testid text-variable',
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
    field: 'data-testid slider-view field',
    slider: 'data-testid slider-view slider',
    root: 'data-testid slider-view',
  },
};

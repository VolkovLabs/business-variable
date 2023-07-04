/**
 * Test Identifiers
 */
export const TestIds = {
  panel: {
    infoMessage: 'data-testid panel info',
    root: 'data-testid panel',
    tab: (name: string) => `data-testid panel tab-${name}`,
  },
  table: {
    buttonExpand: 'data-testid table button-expand',
    buttonFilter: 'data-testid table button-filter',
    cell: (value: string, depth: number) => `data-testid table cell-${depth}-${value}`,
    control: 'data-testid table value-control',
    favoritesControl: 'data-testid table favorites-control',
    fieldFilterValue: 'data-testid table field-filter-value',
    favoritesFilter: 'data-testid table favorites-filter',
    header: 'data-testid table header',
  },
  groupsEditor: {
    buttonAddNew: 'data-testid fields-editor button-add-new',
    buttonRemove: 'data-testid fields-editor button-remove',
    item: (name: string) => `data-testid fields-editor item-${name}`,
    newItem: 'data-testid fields-editor new-level',
    newItemName: 'fields-editor new-item-name',
  },
  levelsEditor: {
    buttonAddNew: 'data-testid levels-editor button-add-new',
    buttonRemove: 'data-testid levels-editor button-remove',
    item: (name: string) => `data-testid levels-editor item-${name}`,
    newItem: 'data-testid levels-editor new-item',
    newItemName: 'data-testidd levels-editor new-item-name',
    root: 'data-testid levels-editor',
  },
};

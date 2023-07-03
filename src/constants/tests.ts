/**
 * Test Identifiers
 */
export const TestIds = {
  panel: {
    infoMessage: 'data-testid panel info',
    root: 'data-testid panel',
  },
  table: {
    buttonExpand: 'data-testid table button-expand',
    buttonFilter: 'data-testid table button-filter',
    cell: (value: string, depth: number) => `data-testid table cell-${depth}-${value}`,
    control: 'data-testid table value-control',
    favoritesControl: 'data-testid table favorites-control',
    fieldFilterValue: 'data-testid table field-filter-value',
    header: 'data-testid table header',
  },
  fieldsEditor: {
    buttonAddNew: 'data-testid fields-editor button-add-new',
    buttonRemove: 'data-testid fields-editor button-remove',
    item: (name: string) => `data-testid fields-editor item-${name}`,
    newItem: 'data-testid fields-editor new-level',
    newItemName: 'fields-editor new-item-name',
  },
  levelsEditor: {
    root: 'data-testid levels-editor',
    item: (name: string) => `data-testid levels-editor item-${name}`,
    newItem: 'data-testid levels-editor new-item',
    newItemName: 'data-testidd levels-editor new-item-name',
    buttonRemove: 'data-testid levels-editor button-remove',
    buttonAddNew: 'data-testid levels-editor button-add-new',
  },
};

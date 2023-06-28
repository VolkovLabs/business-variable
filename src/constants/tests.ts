/**
 * All Constants here
 */

export const TestIds = {
  panel: {
    root: 'data-testid panel',
    infoMessage: 'data-testid panel info',
  },
  table: {
    cell: (value: string, depth: number) => `data-testid table cell-${depth}-${value}`,
    control: 'data-testid table value-control',
    header: 'data-testid table header',
  },
  fieldsEditor: {
    newLevel: 'data-testid fields-editor new-level',
    newLevelField: 'fields-editor new-level-field',
    buttonAddNew: 'data-testid fields-editor button-add-new',
    buttonRemove: 'data-testid fields-editor button-remove',
    level: (name: string) => `data-testid fields-editor level-${name}`,
  },
};

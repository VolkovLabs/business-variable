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
  },
};

import { cx } from '@emotion/css';
import { Button, useStyles2 } from '@grafana/ui';
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { RefObject, useCallback, useState } from 'react';

import { TEST_IDS } from '../../constants';
import { Filter } from './Filter';
import { getStyles } from './Table.styles';

/**
 * Props
 */
interface Props<TTableData extends object> {
  /**
   * Table's columns definition. Must be memoized.
   */
  columns: Array<ColumnDef<TTableData>>;

  /**
   * The data to display in the table. Must be memoized.
   */
  data: TTableData[];

  /**
   * Class Name
   */
  className?: string;

  /**
   * Get Sub Rows
   */
  getSubRows?: TableOptions<TTableData>['getSubRows'];

  /**
   * Show Header Cells
   */
  showHeader?: boolean;

  /**
   * First Selected Row Ref
   */
  firstSelectedRowRef?: RefObject<HTMLTableRowElement>;

  /**
   * Table Ref
   */
  tableRef?: RefObject<HTMLTableElement>;

  /**
   * Table Header Ref
   */
  tableHeaderRef: RefObject<HTMLTableSectionElement>;

  /**
   * Top Offset
   */
  topOffset?: number;

  /**
   * Scrollable Container Ref
   */
  scrollableContainerRef: RefObject<HTMLDivElement>;

  /**
   * Always Visible Filter
   */
  alwaysVisibleFilter: boolean;
}

/**
 * Table Component
 * @param props
 */
export const Table = <TTableData extends object>({
  data,
  className,
  columns,
  getSubRows,
  showHeader = true,
  firstSelectedRowRef,
  tableRef,
  topOffset = 0,
  tableHeaderRef,
  scrollableContainerRef,
  alwaysVisibleFilter,
}: Props<TTableData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * States
   */
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  /**
   * Instance
   */
  const tableInstance = useReactTable<TTableData>({
    columns,
    data,
    autoResetExpanded: false,
    enableSorting: true,
    enableMultiSort: false,
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    enableExpanding: true,
    onExpandedChange: setExpanded,
    initialState: {
      expanded: true,
    },
    state: {
      expanded,
      columnFilters,
    },
  });

  /**
   * Rows model
   */
  const { rows } = tableInstance.getRowModel();

  /**
   * Row Virtualizer
   * Options description - https://tanstack.com/virtual/v3/docs/api/virtualizer
   */
  const rowVirtualizer = useVirtualizer({
    getScrollElement: useCallback(() => scrollableContainerRef.current, [scrollableContainerRef]),
    count: rows.length,
    estimateSize: useCallback(() => 38, []),
    overscan: 10,
  });

  /**
   * Virtualized instance options
   */
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  /**
   * Offsets for hidden rows
   */
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom = virtualRows.length > 0 ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0) : 0;

  let isSelectedRowFound = false;

  return (
    <table className={cx(styles.table, className)} ref={tableRef}>
      {showHeader && (
        <thead
          data-testid={TEST_IDS.table.header}
          className={styles.header}
          style={{ top: topOffset }}
          ref={tableHeaderRef}
        >
          {tableInstance.getHeaderGroups().map((headerGroup) => {
            return (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className={cx(styles.headerCell, {
                        [styles.disableGrow]: !header.column.getCanResize(),
                        [styles.sortableHeader]: header.column.getCanSort(),
                      })}
                      colSpan={header.colSpan}
                      style={{ width: header.column.columnDef.id === 'isFavorite' ? 48 : 'auto' }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <Button
                          icon={
                            !header.column.getIsSorted()
                              ? 'list-ul'
                              : header.column.getIsSorted() === 'asc'
                                ? 'sort-amount-up'
                                : 'sort-amount-down'
                          }
                          fill="text"
                          onClick={header.column.getToggleSortingHandler()}
                          size="sm"
                          className={styles.headerButton}
                          variant={header.column.getIsSorted() ? 'primary' : 'secondary'}
                          data-testid={TEST_IDS.table.buttonSort}
                          title="Sort by status"
                        />
                      )}
                      {header.column.getCanFilter() && (
                        <Filter column={header.column} alwaysVisible={alwaysVisibleFilter} />
                      )}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
      )}

      <tbody>
        {paddingTop > 0 && (
          <tr>
            <td style={{ height: `${paddingTop}px` }} />
          </tr>
        )}
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index];
          const selected = 'selected' in row.original ? row.original.selected : false;
          let ref = undefined;
          if (selected && !isSelectedRowFound) {
            isSelectedRowFound = true;
            ref = firstSelectedRowRef;
          }
          return (
            <tr
              key={row.id}
              className={cx(styles.row, row.getIsExpanded() && styles.expandedRow)}
              ref={ref}
              data-testid={TEST_IDS.table.row(row.id)}
            >
              {row.getVisibleCells().map((cell) => {
                return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
              })}
            </tr>
          );
        })}
        {paddingBottom > 0 && (
          <tr>
            <td style={{ height: `${paddingBottom}px` }} />
          </tr>
        )}
      </tbody>
    </table>
  );
};

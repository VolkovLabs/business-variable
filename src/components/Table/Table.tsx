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
import React, { RefObject, useCallback, useEffect, useState } from 'react';

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

  /**
   * Is Panel Focused
   */
  isFocused: boolean;

  /**
   *  Auto scrol option
   */
  autoScroll: boolean;

  /**
   *  Index of the selected item
   */
  selectedIndex: number;
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
  tableRef,
  topOffset = 0,
  tableHeaderRef,
  scrollableContainerRef,
  alwaysVisibleFilter,
  isFocused,
  autoScroll,
  selectedIndex,
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
    measureElement: useCallback((el: HTMLElement | HTMLTableRowElement) => el.offsetHeight, []),
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

  /**
   * Auto scroll
   * use virtualizer Instance
   * scrollToIndex function
   */
  useEffect(() => {
    if (autoScroll && data && !isFocused && selectedIndex >= 0) {
      /**
       * align property start
       * display a scroll element at the top of the visible container
       */
      rowVirtualizer.scrollToIndex(selectedIndex, { align: 'start' });
    }
  }, [autoScroll, data, isFocused, rowVirtualizer, selectedIndex]);

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
          return (
            <tr
              key={row.id}
              className={cx(styles.row, row.getIsExpanded() && styles.expandedRow)}
              data-testid={TEST_IDS.table.row(row.id)}
            >
              {row.getVisibleCells().map((cell) => {
                return (
                  <td data-index={virtualRow.index} ref={rowVirtualizer.measureElement} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
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

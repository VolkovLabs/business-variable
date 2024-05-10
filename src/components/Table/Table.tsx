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
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getFirstSelectedRowIndex } from 'utils';

import { TEST_IDS } from '../../constants';
import { TableItem } from '../../types';
import { Filter } from './Filter';
import { getStyles } from './Table.styles';

/**
 * Props
 */
interface Props<TTableData extends TableItem> {
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
   *
   * @type {string}
   */
  className?: string;

  /**
   * Get Sub Rows
   */
  getSubRows?: TableOptions<TTableData>['getSubRows'];

  /**
   * Show Header Cells
   *
   * @type {boolean}
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
   *
   * @type {number}
   */
  topOffset?: number;

  /**
   * Scrollable Container Ref
   */
  scrollableContainerRef: RefObject<HTMLDivElement>;

  /**
   * Always Visible Filter
   *
   * @type {boolean}
   */
  alwaysVisibleFilter: boolean;

  /**
   * Is Panel Focused
   */
  isFocused: RefObject<boolean>;

  /**
   * Should scroll
   */
  shouldScroll: RefObject<boolean>;

  /**
   * Auto scroll option
   *
   * @type {boolean}
   */
  autoScroll: boolean;

  /**
   * Function to call after auto scroll
   */
  onAfterScroll: () => void;

  /**
   * Collapse Rows
   *
   * @type {boolean}
   */
  collapseRows: boolean;
}

/**
 * Table Component
 * @param props
 */
export const Table = <TTableData extends TableItem>({
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
  shouldScroll,
  onAfterScroll,
  collapseRows,
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
   * Is Panel Focused
   */
  const isCollapsedByDefault = useRef<boolean>(false);

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
   * Get first visible selected row index from only visible rows
   */
  const firstSelectedRowIndex = useMemo(() => getFirstSelectedRowIndex(rows), [rows]);

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
   * https://tanstack.com/virtual/v3/docs/api/virtualizer#scrolltoindex
   */
  useEffect(() => {
    if (autoScroll && data && (!isFocused.current || shouldScroll.current) && firstSelectedRowIndex >= 0) {
      rowVirtualizer.scrollToIndex(firstSelectedRowIndex, { align: 'start' });
      onAfterScroll();
    }
  }, [autoScroll, firstSelectedRowIndex, data, rowVirtualizer, rows, isFocused, shouldScroll, onAfterScroll]);

  useEffect(() => {
    if (collapseRows && !isCollapsedByDefault.current) {
      tableInstance.toggleAllRowsExpanded(false);
    }
    isCollapsedByDefault.current = true;
  }, [collapseRows, tableInstance]);

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

      <tbody data-testid={TEST_IDS.table.body}>
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

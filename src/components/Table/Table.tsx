import { cx, css } from '@emotion/css';
import React, { Fragment, ReactNode } from 'react';
import {
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  TableOptions,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';

/**
 * Get Styles
 */
const getStyles = (theme: GrafanaTheme2) => {
  const rowHoverBg = theme.colors.emphasize(theme.colors.background.primary, 0.03);

  return {
    table: css`
      border-radius: ${theme.shape.borderRadius()};
      width: 100%;

      td {
        padding: ${theme.spacing(1)};
      }

      td,
      th {
        min-width: ${theme.spacing(3)};
      }
    `,
    disableGrow: css`
      width: 0;
    `,
    header: css`
      border-bottom: 1px solid ${theme.colors.border.weak};
      &,
      & > button {
        position: relative;
        white-space: nowrap;
        padding: ${theme.spacing(1)};
      }
      & > button {
        &:after {
          content: '\\00a0';
        }
        width: 100%;
        height: 100%;
        background: none;
        border: none;
        padding-right: ${theme.spacing(2.5)};
        text-align: left;
        font-weight: ${theme.typography.fontWeightMedium};
      }
    `,
    row: css`
      border-bottom: 1px solid ${theme.colors.border.weak};

      &:hover {
        background-color: ${rowHoverBg};
      }

      &:last-child {
        border-bottom: 0;
      }
    `,
    expandedRow: css`
      border-bottom: none;
    `,
    expandedContentRow: css`
      td {
        border-bottom: 1px solid ${theme.colors.border.weak};
        position: relative;
        padding: ${theme.spacing(2, 2, 2, 5)};

        &:before {
          content: '';
          position: absolute;
          width: 1px;
          top: 0;
          left: 16px;
          bottom: ${theme.spacing(2)};
          background: ${theme.colors.border.medium};
        }
      }
    `,
    sortableHeader: css`
      /* increases selector's specificity so that it always takes precedence over default styles  */
      && {
        padding: 0;
      }
    `,
  };
};

/**
 * Props
 */
interface Props<TableData extends object> {
  /**
   * Table's columns definition. Must be memoized.
   */
  columns: Array<ColumnDef<TableData>>;
  /**
   * The data to display in the table. Must be memoized.
   */
  data: TableData[];
  /**
   * Render function for the expanded row. if not provided, the tables rows will not be expandable.
   */
  renderExpandedRow?: (row: TableData) => ReactNode;
  className?: string;
  /**
   * Must return a unique id for each row
   */
  getRowId: TableOptions<TableData>['getRowId'];
}

/**
 * Table
 * @param data
 * @param className
 * @param columns
 * @param renderExpandedRow
 * @param getRowId
 * @constructor
 */
export const Table = <TableData extends object>({ data, className, columns, getRowId }: Props<TableData>) => {
  const styles = useStyles2(getStyles);

  const tableInstance = useReactTable<TableData>({
    columns,
    data,
    autoResetExpanded: false,
    enableSorting: false,
    enableMultiSort: false,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <table className={cx(styles.table, className)}>
      <thead>
        {tableInstance.getHeaderGroups().map((headerGroup) => {
          return (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    className={cx(styles.header, {
                      [styles.disableGrow]: !header.column.getCanResize(),
                      [styles.sortableHeader]: header.column.getCanSort(),
                    })}
                    colSpan={header.colSpan}
                    {...(header.column.getIsSorted() && {
                      'aria-sort': header.column.getAutoSortDir() === 'desc' ? 'descending' : 'ascending',
                    })}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                );
              })}
            </tr>
          );
        })}
      </thead>

      <tbody>
        {tableInstance.getRowModel().rows.map((row) => {
          return (
            <Fragment key={row.id}>
              <tr className={cx(styles.row, row.getIsExpanded() && styles.expandedRow)}>
                {row.getVisibleCells().map((cell) => {
                  return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                })}
              </tr>
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

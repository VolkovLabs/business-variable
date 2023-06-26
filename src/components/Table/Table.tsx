import { cx } from '@emotion/css';
import React, { Fragment } from 'react';
import {
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  TableOptions,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { useStyles2 } from '@grafana/ui';
import { Styles } from './styles';

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
   * Class Name
   */
  className?: string;

  /**
   * Get Sub Rows
   */
  getSubRows?: TableOptions<TableData>['getSubRows'];
}

/**
 * Table Component
 * @param data
 * @param className
 * @param columns
 * @constructor
 */
export const Table = <TableData extends object>({ data, className, columns, getSubRows }: Props<TableData>) => {
  const styles = useStyles2(Styles);

  /**
   * Instance
   */
  const tableInstance = useReactTable<TableData>({
    columns,
    data,
    autoResetExpanded: false,
    enableSorting: false,
    enableMultiSort: false,
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableExpanding: true,
    initialState: {
      expanded: true,
    },
  });

  return (
    <>
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
    </>
  );
};

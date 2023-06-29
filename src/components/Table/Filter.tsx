import React, { useState, useRef } from 'react';
import { Button, useStyles2, Input } from '@grafana/ui';
import { Column, Table } from '@tanstack/react-table';
import { Styles } from './styles';

/**
 * Props
 * @constructor
 */
interface Props<TableData extends object> {
  column: Column<TableData, unknown>;
  table: Table<TableData>;
}

export const Filter = <TableData extends object>({ table, column }: Props<TableData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(Styles);

  /**
   * States
   */
  const [isOpen, setIsOpen] = useState(false);

  const ref = useRef<HTMLButtonElement>(null);

  const columnFilterValue = column.getFilterValue() as string[];

  return (
    <>
      <Button
        icon="filter"
        fill="text"
        onClick={() => setIsOpen(!isOpen)}
        size="sm"
        className={styles.filterButton}
        ref={ref}
      />
      {isOpen && ref.current && (
        <Input
          placeholder="Search values"
          value={columnFilterValue}
          onChange={(event) => column.setFilterValue(event.currentTarget.value)}
        />
      )}
    </>
  );
};

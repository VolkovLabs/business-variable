import React, { useState, useCallback, FormEvent } from 'react';
import { Button, useStyles2, Input } from '@grafana/ui';
import { Column } from '@tanstack/react-table';
import { TestIds } from '../../constants';
import { Styles } from './styles';

/**
 * Props
 */
interface Props<TableData extends object> {
  column: Column<TableData, unknown>;
}

/**
 * Filter
 * @param props
 */
export const Filter = <TableData extends object>({ column }: Props<TableData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(Styles);

  /**
   * States
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Current filter value
   */
  const columnFilterValue = (column.getFilterValue() as string) || '';

  /**
   * Toggle Filter Visibility
   */
  const onToggleVisibility = useCallback(() => {
    setIsOpen((isOpen) => !isOpen);
  }, []);

  /**
   * Change Filter Value
   */
  const onChangeFilterValue = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      column.setFilterValue(event.currentTarget.value);
    },
    [column]
  );

  return (
    <>
      <Button
        icon="filter"
        fill="text"
        onClick={onToggleVisibility}
        size="sm"
        className={styles.filterButton}
        data-testid={TestIds.table.buttonFilter}
      />
      {isOpen && (
        <Input
          placeholder="Search values"
          value={columnFilterValue}
          onChange={onChangeFilterValue}
          className={styles.filterInput}
          data-testid={TestIds.table.fieldFilterValue}
        />
      )}
    </>
  );
};

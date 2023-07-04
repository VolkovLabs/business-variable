import React, { FormEvent, useCallback, useState } from 'react';
import { Button, Input, useStyles2, Icon } from '@grafana/ui';
import { Column } from '@tanstack/react-table';
import { TestIds } from '../../constants';
import { Styles } from './styles';

/**
 * Props
 */
interface Props<TableData extends object> {
  /**
   * Column
   */
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
  const columnFilterValue = column.getFilterValue();

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

  /**
   * Render filter for isFavorite column
   */
  if (column.columnDef.id === 'isFavorite') {
    return (
      <Button
        variant="secondary"
        fill="text"
        size="sm"
        onClick={() => {
          column.setFilterValue(!columnFilterValue);
        }}
        data-testid={TestIds.table.favoritesFilter}
      >
        {columnFilterValue ? <Icon name="favorite" /> : <Icon name="star" />}
      </Button>
    );
  }

  /**
   * Render filter for other columns
   */
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
          value={typeof columnFilterValue === 'string' ? columnFilterValue : ''}
          onChange={onChangeFilterValue}
          className={styles.filterInput}
          data-testid={TestIds.table.fieldFilterValue}
        />
      )}
    </>
  );
};

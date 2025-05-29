import { Button, Icon, Input, useStyles2 } from '@grafana/ui';
import { Column } from '@tanstack/react-table';
import React, { FormEvent, useCallback, useState } from 'react';

import { TEST_IDS } from '../../constants';
import { getStyles } from './Table.styles';

/**
 * Props
 */
interface Props<TTableData extends object> {
  /**
   * Column
   */
  column: Column<TTableData, unknown>;

  /**
   * Always Visible
   */
  alwaysVisible: boolean;
}

/**
 * Filter
 * @param props
 */
export const Filter = <TTableData extends object>({ column, alwaysVisible }: Props<TTableData>) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  /**
   * States
   */
  const [isOpen, setIsOpen] = useState(alwaysVisible);

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
        data-testid={TEST_IDS.table.favoritesFilter}
      >
        {columnFilterValue ? <Icon name="favorite" /> : <Icon name="star" />}
      </Button>
    );
  }

  /**
   * Render filter for selected values
   */
  if (column.columnDef.id === 'selected') {
    return (
      <Button
        variant="secondary"
        title="Show all selected values"
        className={styles.selectedAllFilterButton}
        fill="text"
        size="sm"
        onClick={() => {
          column.setFilterValue(!columnFilterValue);
        }}
        data-testid={TEST_IDS.table.selectedFilter}
      >
        {columnFilterValue ? <Icon name="check-square" /> : <Icon name="square-shape" />}
      </Button>
    );
  }

  /**
   * Search
   */
  const search = (
    <Input
      placeholder="Search values"
      value={typeof columnFilterValue === 'string' ? columnFilterValue : ''}
      onChange={onChangeFilterValue}
      className={styles.filterInput}
      data-testid={TEST_IDS.table.fieldFilterValue}
      addonAfter={
        columnFilterValue ? (
          <Button
            variant="secondary"
            icon="times"
            onClick={() => column.setFilterValue('')}
            data-testid={TEST_IDS.table.buttonCleanFilterValue}
          />
        ) : null
      }
    />
  );

  /**
   * Always visible enabled
   */
  if (alwaysVisible) {
    return search;
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
        className={styles.headerButton}
        data-testid={TEST_IDS.table.buttonFilter}
      />
      {isOpen && search}
    </>
  );
};

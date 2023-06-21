import React, { useMemo, useCallback } from 'react';
import { DataFrame, EventBus } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { ColumnDef } from '@tanstack/react-table';
import { useTheme2 } from '@grafana/ui';
import { TableItem } from '../../types';
import { Styles } from '../../styles';
import { useRuntimeVariable } from './useRuntimeVariable';

/**
 * Use Table
 */
export const useTable = ({ data, variable, eventBus }: { data?: DataFrame; variable: string; eventBus: EventBus }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = Styles(theme);

  /**
   * Runtime Variable
   */
  const runtimeVariable = useRuntimeVariable(variable, eventBus);

  /**
   * Update Table Data
   */
  const tableData: TableItem[] = useMemo(() => {
    if (!runtimeVariable) {
      return [];
    }

    const isSelectedAll = !!runtimeVariable.options.find((rt) => rt.value.includes('__all') && rt.selected === true);
    const namesArray = data ? data.fields[0].values.toArray() : [];

    return runtimeVariable.options.map((option) => {
      let statusColor;
      let showStatus = false;

      const index = namesArray.findIndex((value) => value === option.value);

      if (index >= 0) {
        showStatus = true;
        const lastValue = data?.fields[1].values.get(index);
        const displayValue = data?.fields[1].display?.(lastValue);
        statusColor = displayValue?.color;
      }

      return {
        ...option,
        selected: isSelectedAll || !!option.selected,
        showStatus,
        statusColor,
      };
    });
  }, [data, runtimeVariable]);

  /**
   * Value Cell Select
   */
  const onChange = useCallback(
    (row: TableItem) => {
      if (!runtimeVariable) {
        return;
      }

      const name = runtimeVariable.name;
      const value = row.text;

      /**
       * All is selected
       */
      if (runtimeVariable.includeAll && !value?.toLowerCase()?.indexOf('all')) {
        locationService.partial({ [`var-${name}`]: value }, true);
        return;
      }

      /**
       * Select a single value if multi select is not enabled
       */
      if (!runtimeVariable.multi) {
        locationService.partial({ [`var-${name}`]: value }, true);
        return;
      }

      /**
       * Search
       */
      const searchParams = locationService
        .getSearch()
        .getAll(`var-${name}`)
        .filter((s) => s.toLowerCase().indexOf('all') !== 0);

      /**
       * Check if any already selected
       */
      const selectedValues = runtimeVariable.options.filter((opt) => opt.selected).map((opt) => opt.text);

      /**
       * Value selected, but not defined in the URL
       */
      if (selectedValues.length && !locationService.getSearchObject()[`var-${name}`]) {
        searchParams.push(...selectedValues);
        locationService.partial({ [`var-${name}`]: [...selectedValues] }, true);
      }

      /**
       * All was selected, changing to the value
       */
      if (runtimeVariable.includeAll && selectedValues.find((opt) => opt.toLowerCase() === 'all')) {
        locationService.partial({ [`var-${name}`]: value }, true);
        return;
      }

      /**
       * Already selected value in multi-value
       */
      if (searchParams.length >= 1) {
        const isSelected = searchParams.includes(value);

        /**
         * Select more
         */
        if (!isSelected) {
          locationService.partial({ [`var-${name}`]: [...searchParams, value] }, true);
          return;
        }

        /**
         * Remove from selected
         */
        locationService.partial(
          {
            [`var-${name}`]: searchParams.filter((sp) => sp !== value),
          },
          true
        );
      }
    },
    [runtimeVariable]
  );

  /**
   * Columns
   */
  const columns: Array<ColumnDef<TableItem>> = useMemo(() => {
    const prefix = `${runtimeVariable?.name || variable}`;
    return [
      {
        id: 'selected',
        header: () => null,
        cell: ({ row }) => {
          return (
            <input
              type={runtimeVariable?.multi ? 'checkbox' : 'radio'}
              onChange={() => onChange(row.original)}
              checked={row.original.selected}
              className={styles.selectControl}
              id={`${prefix}-${row.original.value}`}
            />
          );
        },
        enableResizing: false,
      },
      {
        id: 'value',
        accessorKey: 'value',
        header: runtimeVariable?.label || variable,
        cell: ({ row }) => {
          return (
            <label htmlFor={`${prefix}-${row.original.value}`} className={styles.label}>
              {row.original.showStatus && (
                <span
                  className={styles.status}
                  style={{
                    backgroundColor: row.original.statusColor,
                  }}
                />
              )}
              <span
                style={{
                  fontWeight: row.original.selected
                    ? theme.typography.fontWeightBold
                    : theme.typography.fontWeightRegular,
                }}
              >
                {row.original.text}
              </span>
            </label>
          );
        },
      },
    ];
  }, [
    runtimeVariable?.name,
    runtimeVariable?.label,
    runtimeVariable?.multi,
    variable,
    styles.selectControl,
    styles.label,
    styles.status,
    onChange,
    theme.typography.fontWeightBold,
    theme.typography.fontWeightRegular,
  ]);

  /**
   * Get Row Id
   */
  const getRowId = useCallback((row: TableItem) => {
    return row.value;
  }, []);

  return {
    tableData,
    columns,
    getRowId,
  };
};

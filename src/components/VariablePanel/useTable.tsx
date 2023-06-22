import React, { useMemo, useCallback } from 'react';
import { EventBus, FieldType, PanelData } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { ColumnDef } from '@tanstack/react-table';
import { useTheme2 } from '@grafana/ui';
import { PanelOptions, TableItem } from '../../types';
import { Styles } from '../../styles';
import { useRuntimeVariable } from './useRuntimeVariable';
import { getRows } from './utils';

/**
 * Use Table
 */
export const useTable = ({
  data,
  options,
  eventBus,
}: {
  data: PanelData;
  options: PanelOptions;
  eventBus: EventBus;
}) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = Styles(theme);

  /**
   * Runtime Variable
   */
  const variable = options.variable;
  const runtimeVariable = useRuntimeVariable(variable, eventBus);

  /**
   * Update Table Data
   */
  const tableData: TableItem[] = useMemo(() => {
    if (!runtimeVariable) {
      return [];
    }

    const isSelectedAll = !!runtimeVariable.options.find((rt) => rt.value.includes('__all') && rt.selected === true);

    /**
     * Variable values from data source
     */
    const namesArray = data.series
      .map((series) =>
        series.fields.find((field) => field.type === FieldType.string && (!options.name || field.name === options.name))
      )
      .find((field) => field?.values)
      ?.values?.toArray();

    /**
     * Status values from data source
     */
    const statusArray = data.series
      .map((series) =>
        series.fields.find(
          (field) => field.type === FieldType.number && (!options.status || field.name === options.status)
        )
      )
      .find((field) => field?.values);

    const groupFields =
      variable === 'device'
        ? [
            {
              name: 'country',
            },
            {
              name: 'state',
            },
            {
              name: 'city',
            },
          ]
        : [];
    const fields = [
      ...groupFields,
      { name: variable === 'device' ? 'name' : variable, source: variable === 'device' ? 'B' : 'A' },
    ];

    const rows = getRows(data, fields, (item, key) => {
      let statusColor;
      let showStatus = false;

      /**
       * Status
       */
      const value = item[key as keyof typeof item];
      const index = namesArray?.findIndex((name: any) => name === value);
      if (index !== undefined && index >= 0) {
        showStatus = true;
        const lastValue = statusArray?.values.get(index);
        const displayValue = statusArray?.display?.(lastValue);
        statusColor = displayValue?.color;
      }

      return {
        value,
        selected: isSelectedAll || !!runtimeVariable.options.find((option) => option.value === value)?.selected,
        showStatus,
        statusColor,
      };
    });

    if (rows) {
      return rows;
    }

    return runtimeVariable.options.map((option) => {
      let statusColor;
      let showStatus = false;

      /**
       * Status
       */
      const index = namesArray?.findIndex((value: any) => value === option.value);
      if (index !== undefined && index >= 0) {
        showStatus = true;
        const lastValue = statusArray?.values.get(index);
        const displayValue = statusArray?.display?.(lastValue);
        statusColor = displayValue?.color;
      }

      return {
        value: option.text,
        selected: isSelectedAll || !!option.selected,
        showStatus,
        statusColor,
      };
    });
  }, [runtimeVariable, data, variable, options.name, options.status]);

  /**
   * Value Cell Select
   */
  const onChange = useCallback(
    (row: TableItem) => {
      if (!runtimeVariable) {
        return;
      }

      const name = runtimeVariable.name;
      const value = row.value;

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
        id: 'value',
        accessorKey: 'value',
        header: runtimeVariable?.label || variable,
        cell: ({ row, getValue }) => {
          return (
            <div style={{ paddingLeft: `${row.depth}rem`, display: 'flex' }}>
              <input
                type={runtimeVariable?.multi ? 'checkbox' : 'radio'}
                onChange={() => onChange(row.original)}
                checked={row.original.selected}
                className={styles.selectControl}
                id={`${prefix}-${row.original.value}`}
              />
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
                  {getValue<TableItem['value']>()}
                </span>
              </label>
            </div>
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

  /**
   * Get Sub Rows
   */
  const getSubRows = useCallback((row: TableItem) => {
    return row.children;
  }, []);

  return {
    tableData,
    columns,
    getRowId,
    getSubRows,
  };
};

import React, { useMemo, useCallback } from 'react';
import { EventBus, FieldType, PanelData } from '@grafana/data';
import { ColumnDef } from '@tanstack/react-table';
import { useTheme2 } from '@grafana/ui';
import { PanelOptions, TableItem } from '../../types';
import { Styles } from '../../styles';
import { useRuntimeVariable } from './useRuntimeVariable';
import { getRows, getItemWithStatus, getAllChildrenItems, selectVariableValues } from './utils';

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

    const groupFields = options.groupLevels || [];

    if (groupFields.length) {
      /**
       * Use Group levels
       */
      const rows = getRows(data, groupFields, (item, key, children) => {
        const value = item[key as keyof typeof item];
        return getItemWithStatus(
          {
            value,
            selected: !!runtimeVariable.options.find((option) => option.value === value)?.selected,
          },
          {
            children,
            namesArray,
            statusField: statusArray,
            isSelectedAll,
          }
        );
      });

      if (rows) {
        if (groupFields.length === 1) {
          /**
           * Add all option if only 1 level
           */
          return [
            getItemWithStatus(
              {
                value: 'all',
                selected: isSelectedAll,
              },
              {
                namesArray,
                statusField: statusArray,
                isSelectedAll,
              }
            ),
          ].concat(rows);
        }
        return rows;
      }
    }

    /**
     * Use Variable Options
     */
    return runtimeVariable.options.map((option) => {
      return getItemWithStatus(
        {
          value: option.text,
          selected: !!option.selected,
        },
        {
          namesArray,
          statusField: statusArray,
          isSelectedAll,
        }
      );
    });
  }, [runtimeVariable, data, options.groupLevels, options.name, options.status]);

  /**
   * Value Cell Select
   */
  const onChange = useCallback(
    (row: TableItem) => {
      if (!runtimeVariable) {
        return;
      }

      if (row.children) {
        /**
         * Handle Selection for all child items
         */
        const allChildItems = getAllChildrenItems(row);
        const allValues = allChildItems.map((item) => item.value);

        selectVariableValues(allValues, runtimeVariable);
        return;
      }

      const value = row.value;
      selectVariableValues([value], runtimeVariable);
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
   * Get Sub Rows
   */
  const getSubRows = useCallback((row: TableItem) => {
    return row.children;
  }, []);

  return {
    tableData,
    columns,
    getSubRows,
  };
};

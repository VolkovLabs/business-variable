import React, { useMemo, useCallback } from 'react';
import { EventBus, FieldType, PanelData } from '@grafana/data';
import { ColumnDef } from '@tanstack/react-table';
import { useTheme2, Button } from '@grafana/ui';
import { TestIds } from '../../constants';
import { PanelOptions, TableItem } from '../../types';
import { Styles } from '../../styles';
import { useRuntimeVariables } from './useRuntimeVariables';
import { getRows, getItemWithStatus, selectVariableValues, getFilteredTree, convertTreeToPlain } from './utils';

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
  const variable = options.levels?.length ? options.levels[options.levels.length - 1]?.name : options.variable;
  const { variable: runtimeVariable, getVariable: getRuntimeVariable } = useRuntimeVariables(eventBus, variable);

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

    const groupFields = options.levels || [];

    if (groupFields.length) {
      /**
       * Use Group levels
       */
      const rows = getRows(data, groupFields, (item, key, children) => {
        const value = item[key as keyof typeof item];
        const levelVariable = getRuntimeVariable(key);

        return getItemWithStatus(
          {
            value,
            selected: !!runtimeVariable?.options.find((option) => option.value === value)?.selected,
            variable: levelVariable,
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
        /**
         * Add all option if only 1 level
         */
        if (groupFields.length === 1 && runtimeVariable?.multi && runtimeVariable?.includeAll) {
          return [
            getItemWithStatus(
              {
                value: 'All',
                selected: isSelectedAll,
                variable: getRuntimeVariable(groupFields[0].name),
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
    return (
      runtimeVariable?.options.map((option) => {
        return getItemWithStatus(
          {
            value: option.text,
            selected: !!option.selected,
            variable: runtimeVariable,
          },
          {
            namesArray,
            statusField: statusArray,
            isSelectedAll,
          }
        );
      }) || []
    );
  }, [runtimeVariable, data, options.levels, options.name, options.status, getRuntimeVariable]);

  /**
   * Value Cell Select
   */
  const onChange = useCallback(
    (row: TableItem) => {
      const values = row.childValues || [row.value];

      const filteredTree = getFilteredTree(tableData, values);
      const itemsToUpdate = convertTreeToPlain(filteredTree);

      /**
       * Update All Related Selectable Variables
       */
      itemsToUpdate
        .filter((item) => item.variable !== runtimeVariable && item.selectable)
        .map((item) => ({
          variable: item.variable,
          values: item.values.filter((value) =>
            item.variable?.options.some((option) => option.text === value && !option.selected)
          ),
        }))
        .filter((item) => item.values.length > 0)
        .forEach(({ variable, values }) => {
          selectVariableValues(values, variable);
        });

      /**
       * Update Variable Values
       */
      selectVariableValues(values, runtimeVariable);
    },
    [runtimeVariable, tableData]
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
            <div
              className={styles.rowContent}
              style={{ paddingLeft: theme.spacing(row.depth * 1.5) }}
              data-testid={TestIds.table.cell(getValue() as string, row.depth)}
            >
              {row.original.selectable && (
                <input
                  type={runtimeVariable?.multi ? 'checkbox' : 'radio'}
                  onChange={() => onChange(row.original)}
                  checked={row.original.selected}
                  className={styles.selectControl}
                  id={`${prefix}-${row.original.value}`}
                  data-testid={TestIds.table.control}
                />
              )}

              {row.getCanExpand() && (
                <Button
                  className={styles.expandButton}
                  onClick={row.getToggleExpandedHandler()}
                  variant="secondary"
                  fill="text"
                  size="sm"
                  icon={row.getIsExpanded() ? 'angle-down' : 'angle-right'}
                  data-testid={TestIds.table.buttonExpand}
                />
              )}

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
    styles.rowContent,
    styles.selectControl,
    styles.expandButton,
    styles.label,
    styles.status,
    theme,
    onChange,
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

import React, { useCallback, useMemo } from 'react';
import { EventBus, FieldType, PanelData } from '@grafana/data';
import { Button, Icon, useTheme2 } from '@grafana/ui';
import { ColumnDef } from '@tanstack/react-table';
import { TestIds } from '../../constants';
import { Styles } from '../../styles';
import { Level, PanelOptions, TableItem } from '../../types';
import { useFavorites } from './useFavorites';
import { useRuntimeVariables } from './useRuntimeVariables';
import {
  convertTreeToPlain,
  favoriteFilter,
  getFilteredTree,
  getItemWithStatus,
  getRows,
  selectVariableValues,
  valueFilter,
} from './utils';

/**
 * Use Table
 */
export const useTable = ({
  data,
  options,
  eventBus,
  levels,
}: {
  data: PanelData;
  options: PanelOptions;
  eventBus: EventBus;
  levels?: Level[];
}) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = Styles(theme);

  /**
   * Runtime Variable
   */
  const variable = levels?.length ? levels[levels.length - 1]?.name : options.variable;
  const { variable: runtimeVariable, getVariable: getRuntimeVariable } = useRuntimeVariables(eventBus, variable);

  /**
   * Favorites
   */
  const favorites = useFavorites();

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

    const groupFields = levels || [];

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
            isFavorite: favorites.isAdded(key, value),
            name: key,
          },
          {
            children,
            namesArray,
            statusField: statusArray,
            isSelectedAll,
            favoritesEnabled: options.favorites,
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
                isFavorite: false,
                name: groupFields[0].name,
              },
              {
                namesArray,
                statusField: statusArray,
                isSelectedAll,
                favoritesEnabled: options.favorites,
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
            isFavorite: favorites.isAdded(runtimeVariable.name, option.text),
            name: runtimeVariable.name,
          },
          {
            namesArray,
            statusField: statusArray,
            isSelectedAll,
            favoritesEnabled: options.favorites,
          }
        );
      }) || []
    );
  }, [runtimeVariable, data, levels, options.name, options.status, options.favorites, getRuntimeVariable, favorites]);

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

    const columns: Array<ColumnDef<TableItem>> = [
      {
        id: 'value',
        accessorKey: 'value',
        header: runtimeVariable?.label || variable,
        enableColumnFilter: options.filter,
        filterFn: valueFilter,
        cell: ({ row, getValue }) => {
          const value = getValue() as string;

          return (
            <div
              className={styles.rowContent}
              style={{ paddingLeft: theme.spacing(row.depth * 1.5) }}
              data-testid={TestIds.table.cell(value, row.depth)}
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

              <label htmlFor={`${prefix}-${value}`} className={styles.label}>
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
                  {options.showName ? `${row.original.name}: ` : ''}
                  {value}
                </span>
              </label>
            </div>
          );
        },
      },
    ];

    if (options.favorites) {
      columns.push({
        id: 'isFavorite',
        accessorKey: 'isFavorite',
        enableColumnFilter: true,
        enableResizing: false,
        header: '',
        filterFn: favoriteFilter,
        cell: ({ row, getValue }) => {
          const isFavorite = getValue() as boolean;
          const canBeFavorite = row.original.canBeFavorite;

          if (canBeFavorite) {
            return (
              <Button
                variant="secondary"
                fill="text"
                size="sm"
                onClick={() => {
                  if (isFavorite) {
                    favorites.remove(row.original.variable?.name, row.original.value);
                  } else {
                    favorites.add(row.original.variable?.name, row.original.value);
                  }
                }}
                data-testid={TestIds.table.favoritesControl}
              >
                {isFavorite ? <Icon name="favorite" /> : <Icon name="star" />}
              </Button>
            );
          }

          return null;
        },
      });
    }

    return columns;
  }, [
    runtimeVariable?.name,
    runtimeVariable?.label,
    runtimeVariable?.multi,
    variable,
    options.filter,
    options.favorites,
    options.showName,
    styles.rowContent,
    styles.selectControl,
    styles.expandButton,
    styles.label,
    styles.status,
    theme,
    onChange,
    favorites,
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

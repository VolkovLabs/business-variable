import React, { useCallback, useMemo } from 'react';
import { EventBus, FieldType, PanelData } from '@grafana/data';
import { Button, Icon, useTheme2 } from '@grafana/ui';
import { ColumnDef } from '@tanstack/react-table';
import { Styles } from '../components/TableView/styles';
import { AllValue, AllValueParameter, TestIds } from '../constants';
import { Level, PanelOptions, TableItem, VariableType } from '../types';
import { TextVariable } from '../components/TextVariable';
import {
  convertTreeToPlain,
  favoriteFilter,
  getFilteredTree,
  getItemWithStatus,
  getRows,
  isVariableWithOptions,
  selectVariableValues,
  statusSort,
  valueFilter,
} from '../utils';
import { useFavorites } from './useFavorites';
import { useRuntimeVariables } from './useRuntimeVariables';

/**
 * Table
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

    let isSelectedAll = false;
    if (isVariableWithOptions(runtimeVariable)) {
      isSelectedAll = !!runtimeVariable.options.find(
        (rt) => rt.value.includes(AllValueParameter) && rt.selected === true
      );
    }

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

    if (groupFields.length && isVariableWithOptions(runtimeVariable)) {
      /**
       * Use Group levels
       */
      const rows = getRows(data, groupFields, (item, key, children) => {
        const value = item[key as keyof typeof item];
        const levelVariable = getRuntimeVariable(key);
        const variableOption = runtimeVariable.options.find((option) => option.value === value);

        return getItemWithStatus(
          {
            value,
            selected: variableOption?.selected || false,
            variable: levelVariable,
            isFavorite: favorites.isAdded(key, value),
            name: key,
            label: variableOption?.text.toString() || value,
          },
          {
            children,
            namesArray,
            statusField: statusArray,
            isSelectedAll,
            favoritesEnabled: options.favorites,
            groupSelection: options.groupSelection,
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
                value: AllValue,
                selected: isSelectedAll,
                variable: getRuntimeVariable(groupFields[0].name),
                isFavorite: false,
                name: groupFields[0].name,
                label: AllValue,
              },
              {
                namesArray,
                statusField: statusArray,
                isSelectedAll,
                favoritesEnabled: options.favorites,
                groupSelection: options.groupSelection,
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
    if (isVariableWithOptions(runtimeVariable)) {
      return runtimeVariable.options.map((option) => {
        return getItemWithStatus(
          {
            value: option.value.toString() === AllValueParameter ? AllValue : option.value.toString(),
            selected: !!option.selected,
            variable: runtimeVariable,
            isFavorite: favorites.isAdded(runtimeVariable.name, option.value.toString()),
            label: option.text.toString(),
          },
          {
            namesArray,
            statusField: statusArray,
            isSelectedAll,
            favoritesEnabled: options.favorites,
            groupSelection: options.groupSelection,
          }
        );
      });
    }

    /**
     * Text Box Variable
     */
    if (runtimeVariable.type === VariableType.TEXTBOX) {
      return [
        getItemWithStatus(
          {
            value: runtimeVariable.current.value?.toString() || '',
            label: runtimeVariable.current.text?.toString() || '',
            selected: false,
            variable: runtimeVariable,
            isFavorite: false,
            name: runtimeVariable?.name,
          },
          {
            namesArray,
            statusField: statusArray,
            isSelectedAll,
            favoritesEnabled: options.favorites,
            groupSelection: options.groupSelection,
          }
        ),
      ];
    }

    return [];
  }, [
    runtimeVariable,
    data,
    levels,
    options.name,
    options.status,
    options.favorites,
    options.groupSelection,
    getRuntimeVariable,
    favorites,
  ]);

  /**
   * Value Cell Select
   */
  const onChange = useCallback(
    (item: TableItem) => {
      const values = item.childValues || [item.value];

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
            isVariableWithOptions(item.variable)
              ? item.variable?.options.some((option) => option.text === value && !option.selected)
              : value
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
   * Value Cell Click for Single variables with All selected
   */
  const onClick = useCallback(
    (item: TableItem) => {
      if (
        item.selected &&
        isVariableWithOptions(item.variable) &&
        !item.variable?.multi &&
        item.variable === runtimeVariable
      ) {
        onChange(item);
      }
    },
    [onChange, runtimeVariable]
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
        header: ({ table }) => {
          const isSelectedAll = tableData.every((item) => item.selected);
          const rootRow: TableItem = {
            childValues: tableData.reduce((acc: string[], item) => acc.concat(item.childValues || item.value), []),
            selected: isSelectedAll,
            value: '',
            showStatus: false,
            label: '',
          };
          return (
            <>
              {options.groupSelection && (
                <input
                  type={
                    isVariableWithOptions(runtimeVariable) ? (runtimeVariable?.multi ? 'checkbox' : 'radio') : 'text'
                  }
                  onChange={() => onChange(rootRow)}
                  onClick={() => onClick(rootRow)}
                  checked={isSelectedAll}
                  className={styles.selectControl}
                  id={`${prefix}-all`}
                  data-testid={TestIds.table.control}
                  title="Select all"
                />
              )}
              {table.getCanSomeRowsExpand() && (
                <Button
                  className={styles.expandButton}
                  onClick={table.getToggleAllRowsExpandedHandler()}
                  variant="secondary"
                  fill="text"
                  size="sm"
                  icon={table.getIsAllRowsExpanded() ? 'angle-double-down' : 'angle-double-right'}
                  data-testid={TestIds.table.buttonExpandAll}
                />
              )}
              {runtimeVariable?.label || variable}
            </>
          );
        },
        enableColumnFilter: options.filter,
        filterFn: valueFilter,
        enableSorting: options.statusSort,
        sortingFn: statusSort,
        cell: ({ row, getValue }) => {
          const value = row.original.label || (getValue() as string);

          return (
            <div
              className={styles.rowContent}
              style={{ paddingLeft: theme.spacing(row.depth * 1.5) }}
              data-testid={TestIds.table.cell(value, row.depth)}
            >
              {row.original.selectable && (
                <input
                  type={
                    isVariableWithOptions(runtimeVariable) ? (runtimeVariable?.multi ? 'checkbox' : 'radio') : 'text'
                  }
                  onChange={() => onChange(row.original)}
                  onClick={() => onClick(row.original)}
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

              {isVariableWithOptions(runtimeVariable) && (
                <label
                  onClick={() => {
                    /**
                     * Html For causes loosing panel focus
                     * So we have to call onChange manually
                     */
                    if (row.original.selectable) {
                      onChange(row.original);
                    }
                  }}
                  data-testid={TestIds.table.label}
                  className={styles.label}
                >
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
                    {options.showName && row.original.name ? `${row.original.name}: ` : ''}
                    {value}
                  </span>
                </label>
              )}

              {runtimeVariable?.type === VariableType.TEXTBOX && <TextVariable variable={runtimeVariable} />}
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
        enableSorting: false,
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
    runtimeVariable,
    variable,
    options.filter,
    options.statusSort,
    options.favorites,
    options.groupSelection,
    options.showName,
    tableData,
    styles.selectControl,
    styles.expandButton,
    styles.rowContent,
    styles.label,
    styles.status,
    onChange,
    onClick,
    theme,
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

import { EventBus, InterpolateFunction, PanelData } from '@grafana/data';
import { Button, Icon, useTheme2 } from '@grafana/ui';
import { ColumnDef } from '@tanstack/react-table';
import React, { useCallback, useMemo } from 'react';

import { getStyles } from '../components/TableView/TableView.styles';
import { ALL_VALUE, ALL_VALUE_PARAMETER, TEST_IDS } from '../constants';
import { Level, PanelOptions, RuntimeVariable, StatusStyleMode, TableItem, VariableType } from '../types';
import {
  convertTreeToPlain,
  favoriteFilter,
  getFilteredTree,
  getItemWithStatus,
  getRows,
  isVariableAllSelected,
  isVariableWithOptions,
  selectedFilters,
  selectVariableValues,
  shouldKeepSelection,
  statusSort,
  toPlainArray,
  valueFilter,
} from '../utils';
import { useFavorites } from './useFavorites';
import { useRuntimeVariables } from './useRuntimeVariables';
import { useStatus } from './useStatus';

/**
 * Table
 */
export const useTable = ({
  data,
  options,
  eventBus,
  panelEventBus,
  levels,
  replaceVariables,
}: {
  data: PanelData;
  options: PanelOptions;
  eventBus: EventBus;
  panelEventBus: EventBus;
  levels?: Level[];
  replaceVariables: InterpolateFunction;
}) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * Runtime Variable
   */
  const variable = levels?.length ? levels[levels.length - 1]?.name : options.variable;
  const { variable: runtimeVariable, getVariable: getRuntimeVariable } = useRuntimeVariables(eventBus, variable);

  /**
   * Favorites
   */
  const favorites = useFavorites({ config: options.favorites, replaceVariables });

  /**
   * Status
   */
  const getStatus = useStatus({ data, status: options.status, name: options.name });

  /**
   * Update Table Data
   */
  const tableData: TableItem[] = useMemo(() => {
    if (!runtimeVariable) {
      return [];
    }

    const isSelectedAll = isVariableAllSelected(runtimeVariable);

    const groupFields = levels || [];

    if (groupFields.length && isVariableWithOptions(runtimeVariable)) {
      /**
       * Use Group levels
       */
      const allVariables: Record<string, RuntimeVariable> = {};
      const rows = getRows(data, groupFields, (item, key, children) => {
        /**
         * Convert value to string
         */
        const value = `${item[key as keyof typeof item]}`;
        let levelVariable = allVariables[key];

        if (!levelVariable) {
          const variable = getRuntimeVariable(key);

          if (variable) {
            levelVariable = variable;
            allVariables[key] = variable;
          }
        }
        const variableOption = isVariableWithOptions(levelVariable)
          ? levelVariable.helpers.getOption(value)
          : runtimeVariable.helpers.getOption(value);

        return getItemWithStatus(
          {
            value,
            selected: variableOption?.selected || false,
            variable: levelVariable,
            isFavorite: favorites.isAdded(key, value),
            name: key,
            label: variableOption?.text || value,
          },
          {
            children,
            status: getStatus(value),
            isSelectedAll,
            favoritesEnabled: options.favorites.enabled,
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
                value: ALL_VALUE_PARAMETER,
                selected: isSelectedAll,
                variable: getRuntimeVariable(groupFields[0].name),
                isFavorite: false,
                name: groupFields[0].name,
                label: ALL_VALUE,
              },
              {
                status: getStatus(ALL_VALUE),
                isSelectedAll,
                favoritesEnabled: options.favorites.enabled,
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
            value: option.value,
            selected: option.selected,
            variable: runtimeVariable,
            isFavorite: favorites.isAdded(runtimeVariable.name, option.value),
            label: option.text,
          },
          {
            status: getStatus(option.value === ALL_VALUE_PARAMETER ? ALL_VALUE : option.value),
            isSelectedAll,
            favoritesEnabled: options.favorites.enabled,
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
            status: getStatus(''),
            isSelectedAll,
            favoritesEnabled: options.favorites.enabled,
            groupSelection: options.groupSelection,
          }
        ),
      ];
    }

    return [];
  }, [
    runtimeVariable,
    levels,
    data,
    getRuntimeVariable,
    favorites,
    getStatus,
    options.favorites,
    options.groupSelection,
  ]);

  /**
   * Value Cell Select
   */
  const onChange = useCallback(
    (item: TableItem, isKeepSelection = false) => {
      const values = item.childValues || [item.value];

      const filteredTree = getFilteredTree(tableData, values);
      const itemsToUpdate = convertTreeToPlain(filteredTree);

      /**
       * Enable All Related Selectable Variables
       */
      itemsToUpdate
        .filter((item) => item.variable !== runtimeVariable && item.selectable)
        .map((item) => {
          return {
            variable: item.variable,
            values: item.values.filter((value) => {
              return isVariableWithOptions(item.variable)
                ? item.variable.helpers.getOption(value)?.selected === false
                : value;
            }),
          };
        })
        .filter((item) => item.values.length > 0)
        .forEach(({ variable, values }) => {
          selectVariableValues({
            values,
            runtimeVariable: variable,
            panelEventBus,
            isKeepSelection,
          });
        });

      /**
       * Update Variable Values
       */
      selectVariableValues({
        values,
        runtimeVariable,
        panelEventBus,
        isKeepSelection,
      });
    },
    [panelEventBus, runtimeVariable, tableData]
  );

  /**
   * Value Cell Click for Single variables with All selected
   */
  const onClick = useCallback(
    (item: TableItem, event: React.MouseEvent) => {
      if (
        item.selected &&
        isVariableWithOptions(item.variable) &&
        !item.variable?.multi &&
        item.variable === runtimeVariable
      ) {
        onChange(item, shouldKeepSelection(event));
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
          /**
           * Calculate All Selection
           */
          const isSelectedAll = runtimeVariable ? isVariableAllSelected(runtimeVariable) : false;

          /**
           * Show Header Counts
           */
          const isShowHeaderCounts =
            isVariableWithOptions(runtimeVariable) && runtimeVariable?.multi && options.showTotal;
          /**
           * Selected Options include "all-option" variable
           */
          const selectedOptions = runtimeVariable?.options.some((option) => option.text === 'All' && option.selected)
            ? runtimeVariable?.options.length - 1
            : runtimeVariable?.options.filter((option) => option.selected).length;

          /**
           * All Options include "all-option" variable
           */
          const allOptions = runtimeVariable?.options.some((option) => option.text === 'All')
            ? runtimeVariable?.options.length - 1
            : runtimeVariable?.options.length;

          return (
            <>
              {options.groupSelection && (
                <input
                  type="checkbox"
                  onChange={() => {
                    /**
                     * Root Row
                     */
                    const rootRow: TableItem = {
                      childValues: toPlainArray(tableData, (item) => item.childValues || item.value, []),
                      selected: isSelectedAll,
                      value: '',
                      showStatus: false,
                      label: '',
                      statusMode: StatusStyleMode.COLOR,
                    };
                    onChange(rootRow, false);
                  }}
                  checked={isSelectedAll}
                  className={styles.selectControl}
                  id={`${prefix}-select-all`}
                  data-testid={TEST_IDS.table.allControl}
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
                  data-testid={TEST_IDS.table.buttonExpandAll}
                />
              )}
              {runtimeVariable?.label || variable}
              {isShowHeaderCounts && (
                <span
                  data-testid={TEST_IDS.table.headerGroupCount}
                  style={{
                    marginLeft: theme.spacing(1),
                    fontSize: theme.spacing(1.5),
                    color: theme.colors.text.disabled,
                  }}
                >
                  ({selectedOptions}/{allOptions} selected)
                </span>
              )}
            </>
          );
        },
        enableColumnFilter: options.filter,
        filterFn: valueFilter,
        enableSorting: options.statusSort,
        sortingFn: statusSort,
        cell: ({ row, getValue }) => {
          const value = row.original.label || (getValue() as string);

          /**
           * Show Group Counts
           */
          const isShowGroupCount =
            isVariableWithOptions(runtimeVariable) &&
            runtimeVariable?.multi &&
            options.groupSelection &&
            options.showGroupTotal &&
            row.original.childValues;

          return (
            <div
              className={styles.rowContent}
              style={{ paddingLeft: theme.spacing(row.depth * 1.5) }}
              data-testid={TEST_IDS.table.cell(value, row.depth)}
            >
              {row.original.selectable && (
                <input
                  type={
                    isVariableWithOptions(runtimeVariable) ? (runtimeVariable?.multi ? 'checkbox' : 'radio') : 'text'
                  }
                  onChange={(event) => onChange(row.original, shouldKeepSelection(event))}
                  onClick={(event) => onClick(row.original, event)}
                  checked={row.original.selected}
                  className={styles.selectControl}
                  id={`${prefix}-${row.original.value}`}
                  data-testid={TEST_IDS.table.control}
                  ref={(el) => {
                    /**
                     * Set indeterminate state for checkbox
                     */
                    if (el && el.type === 'checkbox') {
                      const { childSelectedCount = 0, childValues } = row.original;
                      el.indeterminate = (childValues?.length || 0) > childSelectedCount;
                    }
                  }}
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
                  data-testid={TEST_IDS.table.buttonExpand}
                />
              )}

              {isVariableWithOptions(runtimeVariable) && (
                <label
                  onClick={(event) => {
                    /**
                     * Html For causes loosing panel focus
                     * So we have to call onChange manually
                     */
                    if (row.original.selectable) {
                      onChange(row.original, shouldKeepSelection(event));
                      return;
                    }

                    /**
                     * Toggle Expanded State
                     */
                    if (row.getCanExpand()) {
                      row.getToggleExpandedHandler()();
                    }
                  }}
                  data-testid={TEST_IDS.table.label}
                  className={styles.label}
                >
                  {row.original.showStatus && (
                    <>
                      {row.original.statusMode === StatusStyleMode.COLOR && (
                        <span
                          className={styles.status}
                          style={{
                            backgroundColor: row.original.statusColor,
                          }}
                          data-testid={TEST_IDS.table.statusColor}
                        />
                      )}
                      {row.original.statusMode === StatusStyleMode.IMAGE && row.original.statusImage && (
                        <img
                          className={styles.statusImage}
                          src={row.original.statusImage}
                          alt=""
                          data-testid={TEST_IDS.table.statusImage}
                        />
                      )}
                    </>
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
                  {isShowGroupCount && (
                    <span
                      data-testid={TEST_IDS.table.groupCount(value)}
                      style={{
                        marginLeft: theme.spacing(1),
                        fontSize: theme.spacing(1.5),
                        color: theme.colors.text.disabled,
                      }}
                    >
                      ({row.original.childSelectedCount}/{row.original.childValues?.length} selected)
                    </span>
                  )}
                </label>
              )}
            </div>
          );
        },
      },
    ];

    if (options.selectedValues?.showSelected) {
      columns.push({
        id: 'selected',
        accessorKey: 'selected',
        enableColumnFilter: true,
        enableResizing: false,
        enableSorting: false,
        header: '',
        filterFn: selectedFilters,
        cell: () => {
          return null;
        },
      });
    }

    if (options.favorites.enabled) {
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
                data-testid={TEST_IDS.table.favoritesControl}
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
    options.selectedValues?.showSelected,
    options.favorites.enabled,
    options.showTotal,
    options.groupSelection,
    options.showGroupTotal,
    options.showName,
    styles.selectControl,
    styles.expandButton,
    styles.rowContent,
    styles.label,
    styles.status,
    styles.statusImage,
    theme,
    tableData,
    onChange,
    onClick,
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
    runtimeVariable,
  };
};

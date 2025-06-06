import { DataFrame, PanelData } from '@grafana/data';
import { FilterFn, Row, SortingFn } from '@tanstack/react-table';

import { ALL_VALUE_PARAMETER } from '../constants';
import { Level, RuntimeVariable, Status, StatusStyleMode, TableItem } from '../types';
import { isVariableWithOptions } from './variable';

/**
 * Convert Data Frame to objects array
 * @param dataFrame
 */
const convertToObjects = (dataFrame: DataFrame) => {
  const result = [];

  for (let index = 0; index < dataFrame.length; index += 1) {
    const object = dataFrame.fields.reduce((acc, field) => {
      return {
        ...acc,
        [field.name]: field.values[index],
      };
    }, {});

    result.push(object);
  }

  return result;
};

/**
 * Group Items by Field
 * @param items
 * @param fieldKey
 */
const groupBy = (items: object[] | undefined, fieldKey: string): Map<string, object[]> => {
  return (
    items?.reduce((acc: Map<string, object[]>, item) => {
      const key = item[fieldKey as keyof typeof item];
      const existItems = acc.get(key);
      acc.set(key, existItems ? existItems.concat(item) : [item]);
      return acc;
    }, new Map()) || new Map()
  );
};

/**
 * To Plain Array
 * @param array
 * @param getValue
 * @param initialValue
 */
export const toPlainArray = <TItem, TResult>(
  array: TItem[],
  getValue: (item: TItem) => unknown,
  initialValue: TResult[]
): TResult[] => {
  return array.reduce(
    (acc, child) => {
      const value = getValue(child);
      if (Array.isArray(value)) {
        acc.push(...value);
      } else {
        acc.push(value as TResult);
      }
      return acc;
    },
    [...initialValue]
  );
};

/**
 * Recursively Group items
 * @param items
 * @param fieldKeys
 * @param getItem
 */
const getGroupArray = (
  items: object[],
  fieldKeys: string[],
  getItem: (item: object, key: string, children?: TableItem[]) => TableItem
): TableItem[] => {
  const currentKey = fieldKeys[0];

  if (fieldKeys.length === 1) {
    return items
      .map((item) => {
        return getItem(item, currentKey);
      })
      .filter((item) => item.selectable);
  }

  return Array.from(groupBy(items, currentKey), ([key, groupItems]): TableItem => {
    const children = getGroupArray(groupItems, fieldKeys.slice(1), getItem);
    const item = getItem({ [currentKey]: key }, currentKey, children);
    return {
      ...item,
      childValues: toPlainArray(children, (child) => child.childValues || child.value, item.childValues || []),
      childSelectedCount: children.reduce(
        (acc, child) => acc + (child.childSelectedCount ?? (child.selected ? 1 : 0)),
        item.childSelectedCount || 0
      ),
      childFavoritesCount: children.reduce(
        (acc, child) => acc + (child.childFavoritesCount || (child.isFavorite ? 1 : 0)),
        item.childFavoritesCount || 0
      ),
      children,
    };
  }).filter((item) => item.childValues?.length || item.selectable);
};

/**
 * Get Table Rows
 * @param data
 * @param levels
 * @param getItem
 */
export const getRows = (
  data: PanelData,
  levels: Level[],
  getItem?: (item: object, key: string, children?: TableItem[]) => TableItem
): TableItem[] | null => {
  const lastLevel = levels[levels.length - 1];
  const dataFrame = data.series.find((dataFrame, index) =>
    dataFrame.refId === undefined ? index === lastLevel.source : dataFrame.refId === lastLevel.source
  );

  if (!dataFrame) {
    return null;
  }

  /**
   * Data frame as array of objects
   */
  const objects = convertToObjects(dataFrame);

  /**
   * Default Get Item
   * @param item
   * @param key
   */
  const defaultGetItem = (item: object, key: string): TableItem => ({
    value: item[key as keyof typeof item],
    label: item[key as keyof typeof item],
    selected: false,
    showStatus: false,
    selectable: true,
    statusMode: StatusStyleMode.COLOR,
  });

  return getGroupArray(
    objects,
    levels.map(({ name }) => name),
    getItem || defaultGetItem
  );
};

/**
 * Get Item With Status
 * @param item
 * @param status
 * @param children
 * @param isSelectedAll
 * @param favoritesEnabled
 * @param groupSelection
 */
export const getItemWithStatus = (
  item: {
    value: string;
    selected: boolean;
    variable?: RuntimeVariable;
    isFavorite: boolean;
    name?: string;
    label: string;
  },
  {
    status,
    children,
    isSelectedAll,
    favoritesEnabled,
    groupSelection,
  }: {
    status: Status;
    children?: TableItem[];
    isSelectedAll: boolean;
    favoritesEnabled: boolean;
    groupSelection: boolean;
  }
): TableItem => {
  const isAllChildrenSelected = children ? !children.some((child) => !child.selected) : false;
  let selectable = false;
  if (!children && isVariableWithOptions(item.variable)) {
    selectable = !!item.variable.helpers.getOption(item.value);
  } else if (groupSelection && children?.length) {
    selectable = true;
  }

  const canBeFavorite = favoritesEnabled && !children && item.value !== ALL_VALUE_PARAMETER;

  return {
    value: item.value,
    selected: selectable ? isSelectedAll || item.selected || isAllChildrenSelected : false,
    showStatus: status.exist,
    statusColor: status.exist ? status.color : undefined,
    variable: item.variable,
    selectable,
    canBeFavorite,
    isFavorite: canBeFavorite ? item.isFavorite : undefined,
    name: item.name,
    status: status.exist ? status.value : undefined,
    label: item.label,
    statusMode: status.exist ? status.mode : StatusStyleMode.IMAGE,
    statusImage: status.exist ? status.image : undefined,
  };
};

/**
 * Get FilteredTree
 * @param rows
 * @param values
 */
export const getFilteredTree = (rows: TableItem[], values: string[]): TableItem[] => {
  const filteredRows = rows.filter((row) => row.childValues?.some((childValue) => values.includes(childValue)));
  return filteredRows.filter((row) => (row.children ? getFilteredTree(row.children, values) : false));
};

/**
 * Items to Update
 */
type TreePlain = {
  variable?: RuntimeVariable;
  values: string[];
  selectable?: boolean;
};

/**
 * Convert Tree To Plain
 * @param rows
 * @param result
 * @param depth
 */
export const convertTreeToPlain = (rows: TableItem[], result: TreePlain[] = [], depth = 0): TreePlain[] => {
  return rows.reduce((acc, row) => {
    const levelItem = acc[depth] || {
      variable: undefined,
      values: [],
      selectable: false,
    };

    levelItem.variable = row.variable;
    levelItem.values.push(row.value);
    levelItem.selectable = row.selectable;

    const newResult = acc[depth] ? acc : acc.concat(levelItem);
    if (row.children) {
      return convertTreeToPlain(row.children, newResult, depth + 1);
    }

    return newResult;
  }, result);
};

/**
 * Value Filter
 * @param row
 * @param columnId
 * @param searchTerm
 */
export const valueFilter: FilterFn<TableItem> = (row, columnId, searchTerm: string) => {
  const normalizedSearchTerm = searchTerm.toLowerCase();
  /**
   * Filter parent rows
   */
  if (row.original.childValues) {
    return row.original.childValues.some((childValue) => childValue.toLowerCase().includes(normalizedSearchTerm));
  }

  /**
   * Filter last level row
   */
  return row.original.label.toLowerCase().includes(normalizedSearchTerm);
};

/**
 * Status Sort
 * @param rowA
 * @param rowB
 */
export const statusSort: SortingFn<TableItem> = (rowA, rowB): number => {
  const statusA = rowA.original.status !== undefined ? rowA.original.status : 0;
  const statusB = rowB.original.status !== undefined ? rowB.original.status : 0;

  if (statusA === statusB) {
    return 0;
  }

  return statusA > statusB ? 1 : -1;
};

/**
 * Favorite Filter
 * @param row
 * @param columnId
 * @param value
 */
export const favoriteFilter: FilterFn<TableItem> = (row, columnId, value) => {
  if (!value) {
    return true;
  }

  /**
   * Filter parent rows
   */
  if (row.original.childValues) {
    return (row.original.childFavoritesCount || 0) > 0;
  }

  /**
   * Filter last level row
   */
  return !!row.original.isFavorite;
};

/**
 * Selected Filter
 * @param row
 * @param columnId
 * @param value
 */
export const selectedFilters: FilterFn<TableItem> = (row, columnId, value) => {
  if (!value) {
    return true;
  }

  /**
   * Filter parent rows
   */
  if (row.original.childValues) {
    return (row.original.childSelectedCount || 0) > 0;
  }

  /**
   * Filter last level row
   */
  return !!row.original.selected;
};

/**
 * Get First Selected Row Index
 * Rows are only visible items
 * @param rows
 */
export const getFirstSelectedRowIndex = <TTableData extends TableItem>(rows: Array<Row<TTableData>>): number => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];

    /**
     * Row is a group, so skip
     */
    if (row.originalSubRows) {
      continue;
    }

    /**
     * Selected row found
     */
    if (row.original.selected) {
      return rowIndex;
    }
  }

  return -1;
};

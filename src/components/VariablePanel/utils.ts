import { PanelData, DataFrame } from '@grafana/data';
import { TableItem } from '../../types';

interface FieldConfig {
  name: string;
  source?: string;
}

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
        [field.name]: field.values.get(index),
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
 * Recursively Group items
 * @param items
 * @param fieldKeys
 * @param getItem
 */
const getGroupArray = (
  items: object[],
  fieldKeys: string[],
  getItem: (item: object, key: string) => TableItem
): TableItem[] => {
  const currentKey = fieldKeys[0];
  if (fieldKeys.length === 1) {
    return items.map((item) => getItem(item, currentKey));
  }
  return Array.from(
    groupBy(items, currentKey),
    ([key, groupItems]): TableItem => ({
      ...getItem({ [currentKey]: key }, currentKey),
      children: getGroupArray(groupItems, fieldKeys.slice(1), getItem),
    })
  );
};

/**
 * Get Table Rows
 * @param data
 * @param fields
 * @param getItem
 */
export const getRows = (
  data: PanelData,
  fields: FieldConfig[],
  getItem?: (item: object, key: string) => TableItem
): TableItem[] | null => {
  const lastField = fields[fields.length - 1];
  const dataFrame = data.series.find((dataFrame) => dataFrame.refId === lastField.source);

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
    selected: false,
    showStatus: false,
  });

  return getGroupArray(
    objects,
    fields.map(({ name }) => name),
    getItem || defaultGetItem
  );
};

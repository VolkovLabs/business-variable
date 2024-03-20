import { addRow, DataFrame, FieldType, toDataFrame } from '@grafana/data';

import { TableItem } from '../types';
import { convertTreeToPlain, favoriteFilter, getRows, statusSort, valueFilter } from './table';

describe('Table Utils', () => {
  /**
   * Get Data Frame
   */
  const getDataFrame = <TObject extends Record<string, unknown>>(values: TObject[], refId = 'a'): DataFrame => {
    const fields = Object.keys(values[0] || {}).map((key) => ({
      name: key,
      type: FieldType.string,
      values: [],
    }));

    const dataFrame = toDataFrame({
      refId,
      fields,
    });

    for (const item of values) {
      addRow(dataFrame, item);
    }

    return dataFrame;
  };

  describe('getRows', () => {
    const defaultItem = {
      selected: false,
      showStatus: false,
      selectable: true,
    };

    /**
     * Get Item
     * @param item
     * @param key
     */
    const getItem = (item: object, key: string): TableItem => {
      const value = item[key as keyof typeof item];

      return {
        value,
        selected: false,
        showStatus: false,
        selectable: true,
        label: value,
      };
    };

    it('Should work for 1 level', () => {
      const fields = [{ name: 'country', source: 'a' }];
      const frameA = toDataFrame({
        refId: 'a',
        fields: [
          {
            name: 'country',
            values: ['USA', 'Japan'],
          },
        ],
      });
      const result = getRows({ series: [frameA] } as any, fields, getItem);

      expect(result).toEqual([
        {
          value: 'USA',
          label: 'USA',
          ...defaultItem,
        },
        {
          value: 'Japan',
          label: 'Japan',
          ...defaultItem,
        },
      ]);
    });

    it('Should work for 2 levels', () => {
      const fields = [
        { name: 'country', source: 'a' },
        { name: 'state', source: 'a' },
      ];
      const frameA = toDataFrame({
        refId: 'a',
        fields: [
          {
            name: 'country',
            values: ['USA', 'Japan'],
          },
          {
            name: 'state',
            values: ['FL', 'Tokio'],
          },
        ],
      });
      const result = getRows({ series: [frameA] } as any, fields, getItem);

      expect(result).toEqual([
        {
          value: 'USA',
          label: 'USA',
          ...defaultItem,
          childValues: ['FL'],
          childFavoritesCount: 0,
          childSelectedCount: 0,
          children: [
            {
              value: 'FL',
              label: 'FL',
              ...defaultItem,
            },
          ],
        },
        {
          value: 'Japan',
          label: 'Japan',
          ...defaultItem,
          childValues: ['Tokio'],
          childFavoritesCount: 0,
          childSelectedCount: 0,
          children: [
            {
              value: 'Tokio',
              label: 'Tokio',
              ...defaultItem,
            },
          ],
        },
      ]);
    });

    it('Should work for any levels', () => {
      const fields = [
        { name: 'country', source: 'a' },
        { name: 'state', source: 'a' },
        { name: 'city', source: 'a' },
        { name: 'name', source: 'a' },
      ];
      const frameA = toDataFrame({
        refId: 'a',
        fields: [
          {
            name: 'country',
            values: ['USA', 'USA', 'Japan'],
          },
          {
            name: 'state',
            values: ['FL', 'NY', 'Tokio'],
          },
          {
            name: 'city',
            values: ['Tampa', 'New York', 'Tokio'],
          },
          {
            name: 'name',
            values: ['device1', 'device11', 'device12'],
          },
        ],
      });
      const result = getRows({ series: [frameA] } as any, fields, getItem);

      expect(result).toEqual([
        {
          value: 'USA',
          label: 'USA',
          ...defaultItem,
          childValues: ['device1', 'device11'],
          childFavoritesCount: 0,
          childSelectedCount: 0,
          children: [
            {
              value: 'FL',
              label: 'FL',
              childValues: ['device1'],
              ...defaultItem,
              childFavoritesCount: 0,
              childSelectedCount: 0,
              children: [
                {
                  value: 'Tampa',
                  label: 'Tampa',
                  childValues: ['device1'],
                  ...defaultItem,
                  childFavoritesCount: 0,
                  childSelectedCount: 0,
                  children: [
                    {
                      value: 'device1',
                      label: 'device1',
                      ...defaultItem,
                    },
                  ],
                },
              ],
            },
            {
              value: 'NY',
              label: 'NY',
              ...defaultItem,
              childValues: ['device11'],
              childFavoritesCount: 0,
              childSelectedCount: 0,
              children: [
                {
                  value: 'New York',
                  label: 'New York',
                  childValues: ['device11'],
                  ...defaultItem,
                  childFavoritesCount: 0,
                  childSelectedCount: 0,
                  children: [
                    {
                      value: 'device11',
                      label: 'device11',
                      ...defaultItem,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          value: 'Japan',
          label: 'Japan',
          ...defaultItem,
          childValues: ['device12'],
          childFavoritesCount: 0,
          childSelectedCount: 0,
          children: [
            {
              value: 'Tokio',
              label: 'Tokio',
              ...defaultItem,
              childValues: ['device12'],
              childFavoritesCount: 0,
              childSelectedCount: 0,
              children: [
                {
                  value: 'Tokio',
                  label: 'Tokio',
                  ...defaultItem,
                  childValues: ['device12'],
                  childFavoritesCount: 0,
                  childSelectedCount: 0,
                  children: [
                    {
                      value: 'device12',
                      label: 'device12',
                      ...defaultItem,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('Should find correct dataFrame by index ', () => {
      const fields = [{ name: 'country', source: 0 }];
      const frameA = toDataFrame({
        fields: [
          {
            name: 'country',
            values: ['USA', 'Japan'],
          },
        ],
      });
      const result = getRows({ series: [frameA] } as any, fields, getItem);

      expect(result).toEqual([
        {
          value: 'USA',
          label: 'USA',
          ...defaultItem,
        },
        {
          value: 'Japan',
          label: 'Japan',
          ...defaultItem,
        },
      ]);
    });

    it('Should filter groups with unselectable child values', () => {
      const fields = [
        { name: 'country', source: 'a' },
        { name: 'state', source: 'a' },
        { name: 'city', source: 'a' },
        { name: 'name', source: 'a' },
      ];
      const frameA = toDataFrame({
        refId: 'a',
        fields: [
          {
            name: 'country',
            values: ['USA', 'USA', 'Japan'],
          },
          {
            name: 'state',
            values: ['FL', 'NY', 'Tokio'],
          },
          {
            name: 'city',
            values: ['Tampa', 'New York', 'Tokio'],
          },
          {
            name: 'name',
            values: ['device1', 'device11', 'device12'],
          },
        ],
      });

      const getItem = (item: object, key: string): TableItem => {
        const value = item[key as keyof typeof item];

        return {
          value,
          selected: false,
          showStatus: false,
          selectable: value === 'device1' || value === 'device11',
          label: value,
        };
      };

      const result = getRows({ series: [frameA] } as any, fields, getItem);

      expect(result).toEqual([
        {
          value: 'USA',
          label: 'USA',
          ...defaultItem,
          selectable: false,
          childValues: ['device1', 'device11'],
          childFavoritesCount: 0,
          childSelectedCount: 0,
          children: [
            {
              value: 'FL',
              label: 'FL',
              childValues: ['device1'],
              ...defaultItem,
              selectable: false,
              childFavoritesCount: 0,
              childSelectedCount: 0,
              children: [
                {
                  value: 'Tampa',
                  label: 'Tampa',
                  childValues: ['device1'],
                  ...defaultItem,
                  selectable: false,
                  childFavoritesCount: 0,
                  childSelectedCount: 0,
                  children: [
                    {
                      value: 'device1',
                      label: 'device1',
                      ...defaultItem,
                    },
                  ],
                },
              ],
            },
            {
              value: 'NY',
              label: 'NY',
              ...defaultItem,
              selectable: false,
              childValues: ['device11'],
              childFavoritesCount: 0,
              childSelectedCount: 0,
              children: [
                {
                  value: 'New York',
                  label: 'New York',
                  childValues: ['device11'],
                  ...defaultItem,
                  selectable: false,
                  childFavoritesCount: 0,
                  childSelectedCount: 0,
                  children: [
                    {
                      value: 'device11',
                      label: 'device11',
                      ...defaultItem,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('Should add childFavoritesCount', () => {
      const fields = [
        { name: 'country', source: 'a' },
        { name: 'state', source: 'a' },
        { name: 'city', source: 'a' },
        { name: 'name', source: 'a' },
      ];
      const frameA = toDataFrame({
        refId: 'a',
        fields: [
          {
            name: 'country',
            values: ['USA', 'USA', 'Japan'],
          },
          {
            name: 'state',
            values: ['FL', 'NY', 'Tokio'],
          },
          {
            name: 'city',
            values: ['Tampa', 'New York', 'Tokio'],
          },
          {
            name: 'name',
            values: ['device1', 'device11', 'device12'],
          },
        ],
      });

      const getItem = (item: object, key: string): TableItem => {
        const value = item[key as keyof typeof item];

        return {
          value,
          selected: false,
          showStatus: false,
          selectable: value === 'device1' || value === 'device11' || value === 'device12',
          isFavorite: value === 'device1' || value === 'device12',
          label: value,
        };
      };

      const result = getRows({ series: [frameA] } as any, fields, getItem);

      expect(result).toEqual([
        {
          value: 'USA',
          label: 'USA',
          ...defaultItem,
          selectable: false,
          isFavorite: false,
          childValues: ['device1', 'device11'],
          childFavoritesCount: 1,
          childSelectedCount: 0,
          children: [
            {
              value: 'FL',
              label: 'FL',
              childValues: ['device1'],
              ...defaultItem,
              selectable: false,
              isFavorite: false,
              childFavoritesCount: 1,
              childSelectedCount: 0,
              children: [
                {
                  value: 'Tampa',
                  label: 'Tampa',
                  childValues: ['device1'],
                  ...defaultItem,
                  selectable: false,
                  isFavorite: false,
                  childFavoritesCount: 1,
                  childSelectedCount: 0,
                  children: [
                    {
                      value: 'device1',
                      label: 'device1',
                      ...defaultItem,
                      isFavorite: true,
                      selectable: true,
                    },
                  ],
                },
              ],
            },
            {
              value: 'NY',
              label: 'NY',
              ...defaultItem,
              selectable: false,
              isFavorite: false,
              childValues: ['device11'],
              childFavoritesCount: 0,
              childSelectedCount: 0,
              children: [
                {
                  value: 'New York',
                  label: 'New York',
                  childValues: ['device11'],
                  ...defaultItem,
                  selectable: false,
                  isFavorite: false,
                  childFavoritesCount: 0,
                  childSelectedCount: 0,
                  children: [
                    {
                      value: 'device11',
                      label: 'device11',
                      ...defaultItem,
                      isFavorite: false,
                      selectable: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          value: 'Japan',
          label: 'Japan',
          ...defaultItem,
          selectable: false,
          childValues: ['device12'],
          isFavorite: false,
          childFavoritesCount: 1,
          childSelectedCount: 0,
          children: [
            {
              value: 'Tokio',
              label: 'Tokio',
              childValues: ['device12'],
              ...defaultItem,
              selectable: false,
              isFavorite: false,
              childFavoritesCount: 1,
              childSelectedCount: 0,
              children: [
                {
                  value: 'Tokio',
                  label: 'Tokio',
                  childValues: ['device12'],
                  ...defaultItem,
                  selectable: false,
                  isFavorite: false,
                  childFavoritesCount: 1,
                  childSelectedCount: 0,
                  children: [
                    {
                      value: 'device12',
                      label: 'device12',
                      ...defaultItem,
                      isFavorite: true,
                      selectable: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('Should add childSelectedCount', () => {
      const fields = [
        { name: 'country', source: 'a' },
        { name: 'state', source: 'a' },
        { name: 'city', source: 'a' },
        { name: 'name', source: 'a' },
      ];
      const frameA = getDataFrame([
        {
          country: 'USA',
          state: 'FL',
          city: 'Tampa',
          name: 'device-usa-fl-tampa-1',
        },
        {
          country: 'USA',
          state: 'FL',
          city: 'Tampa',
          name: 'device-usa-fl-tampa-2',
        },
        {
          country: 'USA',
          state: 'NY',
          city: 'New York',
          name: 'device-usa-ny-ny-1',
        },
        {
          country: 'Japan',
          state: 'Tokio',
          city: 'Tokio',
          name: 'device-japan-tokyo-tokyo-1',
        },
      ]);

      const getItem = (item: object, key: string): TableItem => {
        const value = item[key as keyof typeof item];

        return {
          value,
          selected: value !== 'device-usa-fl-tampa-2',
          showStatus: false,
          selectable: true,
          isFavorite: false,
          label: value,
        };
      };

      const result = getRows({ series: [frameA] } as any, fields, getItem);

      expect(result).toEqual([
        expect.objectContaining({
          value: 'USA',
          childValues: ['device-usa-fl-tampa-1', 'device-usa-fl-tampa-2', 'device-usa-ny-ny-1'],
          childSelectedCount: 2,
          children: [
            expect.objectContaining({
              value: 'FL',
              childValues: ['device-usa-fl-tampa-1', 'device-usa-fl-tampa-2'],
              childSelectedCount: 1,
              children: [
                expect.objectContaining({
                  value: 'Tampa',
                  childSelectedCount: 1,
                  childValues: ['device-usa-fl-tampa-1', 'device-usa-fl-tampa-2'],
                  children: [
                    expect.objectContaining({
                      value: 'device-usa-fl-tampa-1',
                      selected: true,
                    }),
                    expect.objectContaining({
                      value: 'device-usa-fl-tampa-2',
                      selected: false,
                    }),
                  ],
                }),
              ],
            }),
            expect.objectContaining({
              value: 'NY',
              childValues: ['device-usa-ny-ny-1'],
              childSelectedCount: 1,
              children: [
                expect.objectContaining({
                  value: 'New York',
                  childSelectedCount: 1,
                  childValues: ['device-usa-ny-ny-1'],
                  children: [
                    expect.objectContaining({
                      value: 'device-usa-ny-ny-1',
                      selected: true,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        expect.objectContaining({
          value: 'Japan',
          childValues: ['device-japan-tokyo-tokyo-1'],
          childSelectedCount: 1,
          children: [
            expect.objectContaining({
              value: 'Tokio',
              childValues: ['device-japan-tokyo-tokyo-1'],
              childSelectedCount: 1,
              children: [
                expect.objectContaining({
                  value: 'Tokio',
                  childSelectedCount: 1,
                  childValues: ['device-japan-tokyo-tokyo-1'],
                  children: [
                    expect.objectContaining({
                      value: 'device-japan-tokyo-tokyo-1',
                      selected: true,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ]);
    });

    it('Should skip if no dataFrame found', () => {
      const fields = [{ name: 'country', source: 'b' }];
      const frameA = toDataFrame({
        refId: 'a',
        fields: [
          {
            name: 'country',
            values: ['USA', 'Japan'],
          },
        ],
      });
      const result = getRows({ series: [frameA] } as any, fields);

      expect(result).toEqual(null);
    });

    it('Should use default getItem', () => {
      const fields = [{ name: 'country', source: 'a' }];
      const frameA = toDataFrame({
        refId: 'a',
        fields: [
          {
            name: 'country',
            values: ['USA', 'Japan'],
          },
        ],
      });
      const result = getRows({ series: [frameA] } as any, fields);

      expect(result).toEqual([
        {
          value: 'USA',
          label: 'USA',
          selected: false,
          showStatus: false,
          selectable: true,
        },
        {
          value: 'Japan',
          label: 'Japan',
          selected: false,
          showStatus: false,
          selectable: true,
        },
      ]);
    });
  });

  describe('convertTreeToPlain', () => {
    it('Should Convert tree structure to plain', () => {
      expect(
        convertTreeToPlain([
          {
            value: '1',
            children: [
              {
                value: '1-2',
                children: [
                  {
                    value: '1-3',
                    selectable: true,
                  },
                ],
              },
            ],
          },
          {
            value: '2',
            children: [
              {
                value: '2-2',
                children: [
                  {
                    value: '2-3',
                    selectable: true,
                  },
                ],
              },
            ],
          },
          {
            value: '3',
            children: [
              {
                value: '3-2',
                children: [
                  {
                    value: '3-3',
                    selectable: true,
                  },
                ],
              },
            ],
          },
        ] as any)
      ).toEqual([
        {
          values: ['1', '2', '3'],
        },
        {
          values: ['1-2', '2-2', '3-2'],
        },
        {
          values: ['1-3', '2-3', '3-3'],
          selectable: true,
        },
      ]);
    });
  });

  describe('Value Filter', () => {
    it('Should include parent row if value exists in childValues', () => {
      const parentRow = { original: { childValues: ['device1', 'device2'] } };

      expect(valueFilter(parentRow as any, {} as any, 'Device2', () => {})).toBeTruthy();
      expect(valueFilter(parentRow as any, {} as any, 'Device3', () => {})).toBeFalsy();
    });

    it('Should include row if label matches', () => {
      const row = { original: { value: '1', label: 'Device1' } };

      expect(valueFilter(row as any, {} as any, 'Device1', () => {})).toBeTruthy();
      expect(valueFilter(row as any, {} as any, 'Device2', () => {})).toBeFalsy();
    });
  });

  describe('Favorite Filter', () => {
    it('Should include parent row if child favorites exist', () => {
      const parentRow1 = { original: { childFavoritesCount: 1, childValues: ['device1'] } };
      const parentRow2 = { original: { childFavoritesCount: 0, childValues: ['device2'] } };

      expect(favoriteFilter(parentRow1 as any, {} as any, true, () => {})).toBeTruthy();
      expect(favoriteFilter(parentRow2 as any, {} as any, true, () => {})).toBeFalsy();
    });

    it('Should include row if favorite', () => {
      const row1 = { original: { value: 'device1', isFavorite: true } };
      const row2 = { original: { value: 'device1', isFavorite: false } };

      expect(favoriteFilter(row1 as any, {} as any, true, () => {})).toBeTruthy();
      expect(favoriteFilter(row2 as any, {} as any, true, () => {})).toBeFalsy();
    });

    it('Should include all rows if filter disabled', () => {
      const row1 = { original: { value: 'device1', isFavorite: true } };
      const row2 = { original: { value: 'device1', isFavorite: false } };
      const parentRow = { original: { childFavoritesCount: 0, childValues: ['device2'] } };

      expect(favoriteFilter(row1 as any, {} as any, false, () => {})).toBeTruthy();
      expect(favoriteFilter(row2 as any, {} as any, false, () => {})).toBeTruthy();
      expect(favoriteFilter(parentRow as any, {} as any, false, () => {})).toBeTruthy();
    });
  });

  describe('Status Sort', () => {
    it('Should sort A lower B', () => {
      const rowA = { original: { status: 50 } };
      const rowB = { original: { status: 60 } };

      expect(statusSort(rowA as any, rowB as any, 'value')).toEqual(-1);
    });

    it('Should sort A higher B', () => {
      const rowA = { original: { status: 60 } };
      const rowB = { original: { status: 50 } };

      expect(statusSort(rowA as any, rowB as any, 'value')).toEqual(1);
    });

    it('Should keep A position', () => {
      const rowA = { original: { status: 50 } };
      const rowB = { original: { status: 50 } };

      expect(statusSort(rowA as any, rowB as any, 'value')).toEqual(0);
    });

    it('Should keep A position if no status', () => {
      const rowA = { original: {} };
      const rowB = { original: {} };

      expect(statusSort(rowA as any, rowB as any, 'value')).toEqual(0);
    });
  });
});

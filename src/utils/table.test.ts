import { toDataFrame } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { AllValue } from '../constants';
import { TableItem } from '../types';
import { convertTreeToPlain, favoriteFilter, getRows, selectVariableValues, statusSort, valueFilter } from './table';

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  locationService: {
    getSearch: jest.fn(),
    getSearchObject: jest.fn(() => ({})),
    partial: jest.fn(),
  },
}));

describe('Utils', () => {
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
          ...defaultItem,
        },
        {
          value: 'Japan',
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
          ...defaultItem,
          childValues: ['FL'],
          childFavoritesCount: 0,
          children: [
            {
              value: 'FL',
              ...defaultItem,
            },
          ],
        },
        {
          value: 'Japan',
          ...defaultItem,
          childValues: ['Tokio'],
          childFavoritesCount: 0,
          children: [
            {
              value: 'Tokio',
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
          ...defaultItem,
          childValues: ['device1', 'device11'],
          childFavoritesCount: 0,
          children: [
            {
              value: 'FL',
              childValues: ['device1'],
              ...defaultItem,
              childFavoritesCount: 0,
              children: [
                {
                  value: 'Tampa',
                  childValues: ['device1'],
                  ...defaultItem,
                  childFavoritesCount: 0,
                  children: [
                    {
                      value: 'device1',
                      ...defaultItem,
                    },
                  ],
                },
              ],
            },
            {
              value: 'NY',
              ...defaultItem,
              childValues: ['device11'],
              childFavoritesCount: 0,
              children: [
                {
                  value: 'New York',
                  childValues: ['device11'],
                  ...defaultItem,
                  childFavoritesCount: 0,
                  children: [
                    {
                      value: 'device11',
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
          ...defaultItem,
          childValues: ['device12'],
          childFavoritesCount: 0,
          children: [
            {
              value: 'Tokio',
              ...defaultItem,
              childValues: ['device12'],
              childFavoritesCount: 0,
              children: [
                {
                  value: 'Tokio',
                  ...defaultItem,
                  childValues: ['device12'],
                  childFavoritesCount: 0,
                  children: [
                    {
                      value: 'device12',
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

    it('Should filter unselectable values', () => {
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
        };
      };

      const result = getRows({ series: [frameA] } as any, fields, getItem);

      expect(result).toEqual([
        {
          value: 'USA',
          ...defaultItem,
          selectable: false,
          childValues: ['device1', 'device11'],
          childFavoritesCount: 0,
          children: [
            {
              value: 'FL',
              childValues: ['device1'],
              ...defaultItem,
              selectable: false,
              childFavoritesCount: 0,
              children: [
                {
                  value: 'Tampa',
                  childValues: ['device1'],
                  ...defaultItem,
                  selectable: false,
                  childFavoritesCount: 0,
                  children: [
                    {
                      value: 'device1',
                      ...defaultItem,
                    },
                  ],
                },
              ],
            },
            {
              value: 'NY',
              ...defaultItem,
              selectable: false,
              childValues: ['device11'],
              childFavoritesCount: 0,
              children: [
                {
                  value: 'New York',
                  childValues: ['device11'],
                  ...defaultItem,
                  selectable: false,
                  childFavoritesCount: 0,
                  children: [
                    {
                      value: 'device11',
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
        };
      };

      const result = getRows({ series: [frameA] } as any, fields, getItem);

      expect(result).toEqual([
        {
          value: 'USA',
          ...defaultItem,
          selectable: false,
          isFavorite: false,
          childValues: ['device1', 'device11'],
          childFavoritesCount: 1,
          children: [
            {
              value: 'FL',
              childValues: ['device1'],
              ...defaultItem,
              selectable: false,
              isFavorite: false,
              childFavoritesCount: 1,
              children: [
                {
                  value: 'Tampa',
                  childValues: ['device1'],
                  ...defaultItem,
                  selectable: false,
                  isFavorite: false,
                  childFavoritesCount: 1,
                  children: [
                    {
                      value: 'device1',
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
              ...defaultItem,
              selectable: false,
              isFavorite: false,
              childValues: ['device11'],
              childFavoritesCount: 0,
              children: [
                {
                  value: 'New York',
                  childValues: ['device11'],
                  ...defaultItem,
                  selectable: false,
                  isFavorite: false,
                  childFavoritesCount: 0,
                  children: [
                    {
                      value: 'device11',
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
          ...defaultItem,
          selectable: false,
          childValues: ['device12'],
          isFavorite: false,
          childFavoritesCount: 1,
          children: [
            {
              value: 'Tokio',
              childValues: ['device12'],
              ...defaultItem,
              selectable: false,
              isFavorite: false,
              childFavoritesCount: 1,
              children: [
                {
                  value: 'Tokio',
                  childValues: ['device12'],
                  ...defaultItem,
                  selectable: false,
                  isFavorite: false,
                  childFavoritesCount: 1,
                  children: [
                    {
                      value: 'device12',
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
          selected: false,
          showStatus: false,
          selectable: true,
        },
        {
          value: 'Japan',
          selected: false,
          showStatus: false,
          selectable: true,
        },
      ]);
    });
  });

  describe('selectVariableValues', () => {
    beforeEach(() => {
      jest.mocked(locationService.partial).mockClear();
    });

    describe('Single', () => {
      jest.mocked(locationService.getSearch).mockImplementation(
        () =>
          ({
            getAll: jest.fn(() => []),
          } as any)
      );

      it('Should apply only first value', () => {
        const variable = { name: 'variable', options: [] };
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: 'value1',
          },
          true
        );
      });

      it('Should apply all value', () => {
        const variable = { name: 'variable', options: [] };
        selectVariableValues(['all'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: 'all',
          },
          true
        );
      });
    });

    describe('Multi', () => {
      jest.mocked(locationService.getSearch).mockImplementation(
        () =>
          ({
            getAll: jest.fn(() => []),
          } as any)
      );

      it('Should apply all values', () => {
        const variable = { name: 'variable', options: [], multi: true };
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2'],
          },
          true
        );
      });

      it('Should add all values to already selected values', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['selected1', 'selected2']),
            } as any)
        );
        const variable = { name: 'variable', options: [], multi: true };
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1', 'selected2'],
          },
          true
        );
      });

      it('Should add all unique values to already selected values', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['value2', 'selected1', 'selected2']),
            } as any)
        );
        const variable = { name: 'variable', options: [], multi: true };
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1', 'selected2'],
          },
          true
        );
      });

      it('Should set only all value if all was passed', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['value2', 'selected1', 'selected2']),
            } as any)
        );
        const variable = { name: 'variable', options: [], multi: true };
        selectVariableValues(['value1', 'all'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: AllValue,
          },
          true
        );

        /**
         * Check case-insensitive of all value
         */
        jest.mocked(locationService.partial).mockClear();
        selectVariableValues(['value1', AllValue], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: AllValue,
          },
          true
        );
      });

      it('Should deselect values if all already selected', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['value1', 'value2', 'selected1', 'selected2']),
            } as any)
        );
        const variable = { name: 'variable', options: [], multi: true };
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['selected1', 'selected2'],
          },
          true
        );
      });

      it('Should select values if some already selected', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['value1', 'selected1', 'selected2']),
            } as any)
        );
        const variable = { name: 'variable', options: [], multi: true };
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1', 'selected2'],
          },
          true
        );
      });

      it('Should adjust values if they not defined in url ', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => []),
            } as any)
        );
        jest.mocked(locationService.getSearchObject).mockImplementation(() => ({}));
        const variable = {
          name: 'variable',
          options: [
            { text: 'selected1', selected: true },
            { text: 'notSelected', selected: false },
          ],
          multi: true,
        };
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1'],
          },
          true
        );
      });
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

    it('Should include row if value matches', () => {
      const row = { original: { value: 'device1' } };

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

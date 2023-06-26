import { toDataFrame } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { getRows, selectVariableValues, convertTreeToPlain } from './utils';

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
      const result = getRows({ series: [frameA] } as any, fields);

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
      const result = getRows({ series: [frameA] } as any, fields);

      expect(result).toEqual([
        {
          value: 'USA',
          ...defaultItem,
          childValues: ['FL'],
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
      const result = getRows({ series: [frameA] } as any, fields);

      expect(result).toEqual([
        {
          value: 'USA',
          ...defaultItem,
          childValues: ['device1', 'device11'],
          children: [
            {
              value: 'FL',
              childValues: ['device1'],
              ...defaultItem,
              children: [
                {
                  value: 'Tampa',
                  childValues: ['device1'],
                  ...defaultItem,
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
              children: [
                {
                  value: 'New York',
                  childValues: ['device11'],
                  ...defaultItem,
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
          children: [
            {
              value: 'Tokio',
              ...defaultItem,
              childValues: ['device12'],
              children: [
                {
                  value: 'Tokio',
                  ...defaultItem,
                  childValues: ['device12'],
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
            [`var-${variable.name}`]: 'All',
          },
          true
        );

        /**
         * Check case-insensitive of all value
         */
        jest.mocked(locationService.partial).mockClear();
        selectVariableValues(['value1', 'All'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: 'All',
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
        },
      ]);
    });
  });
});

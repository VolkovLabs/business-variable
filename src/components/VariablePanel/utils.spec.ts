import { toDataFrame } from '@grafana/data';
import { getRows } from './utils';

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
          children: [
            {
              value: 'FL',
              ...defaultItem,
              children: [
                {
                  value: 'Tampa',
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
              children: [
                {
                  value: 'New York',
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
          children: [
            {
              value: 'Tokio',
              ...defaultItem,
              children: [
                {
                  value: 'Tokio',
                  ...defaultItem,
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
});

import React from 'react';
import { toDataFrame } from '@grafana/data';
import { fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { TestIds } from '../../constants';
import { TableItem } from '../../types';
import { useFavorites } from './useFavorites';
import { useRuntimeVariables } from './useRuntimeVariables';
import { useTable } from './useTable';
import { selectVariableValues } from './utils';

/**
 * Mock useRuntimeVariables
 */
jest.mock('./useRuntimeVariables', () => ({
  useRuntimeVariables: jest.fn(() => ({
    variable: null,
    getVariable: jest.fn(),
  })),
}));

/**
 * Mock useFavorites
 */
jest.mock('./useFavorites', () => ({
  useFavorites: jest.fn(() => ({
    remove: jest.fn(),
    add: jest.fn(),
    isAdded: jest.fn(),
  })),
}));

/**
 * Mock utils
 */
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  selectVariableValues: jest.fn(),
}));

describe('Use Table Hook', () => {
  it('Should return variable options if no levels', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: {
            options: [
              {
                text: 'option1',
                value: 'option1',
                selected: true,
              },
              {
                text: 'option2',
                value: 'option2',
                selected: false,
              },
            ],
          },
        } as any)
    );

    /**
     * Use Table
     */
    const { result } = renderHook(() =>
      useTable({ data: { series: [] } as any, options: {} as any, eventBus: null as any })
    );

    expect(result.current.tableData).toEqual([
      expect.objectContaining({
        value: 'option1',
        selected: true,
        selectable: true,
      }),
      expect.objectContaining({
        value: 'option2',
        selected: false,
        selectable: true,
      }),
    ]);
  });

  it('Should add All option for single level', () => {
    const variable = {
      multi: true,
      includeAll: true,
      options: [
        {
          text: 'All',
          value: '__all',
          selected: false,
        },
        {
          text: 'device1',
          value: 'device1',
          selected: true,
        },
        {
          text: 'device2',
          value: 'device2',
          selected: false,
        },
      ],
    };
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable,
          getVariable: jest.fn(() => variable),
        } as any)
    );
    const dataFrame = toDataFrame({
      fields: [
        {
          name: 'device',
          values: ['device1', 'device2'],
        },
      ],
      refId: 'A',
    });

    /**
     * Use Table
     */
    const { result } = renderHook(() =>
      useTable({
        data: { series: [dataFrame] } as any,
        options: {
          levels: [{ name: 'device', source: 'A' }],
        } as any,
        eventBus: null as any,
      })
    );

    expect(result.current.tableData).toEqual([
      expect.objectContaining({
        value: 'All',
        selected: false,
        selectable: true,
      }),
      expect.objectContaining({
        value: 'device1',
        selected: true,
        selectable: true,
      }),
      expect.objectContaining({
        value: 'device2',
        selected: false,
        selectable: true,
      }),
    ]);
  });

  it('Should return rows with subRows if nested levels', () => {
    const variable = {
      multi: true,
      includeAll: true,
      options: [
        {
          text: 'All',
          value: '__all',
          selected: false,
        },
        {
          text: 'device1',
          value: 'device1',
          selected: true,
        },
        {
          text: 'device2',
          value: 'device2',
          selected: false,
        },
      ],
    };
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable,
          getVariable: jest.fn(() => variable),
        } as any)
    );
    const dataFrame = toDataFrame({
      fields: [
        {
          name: 'country',
          values: ['USA', 'Japan'],
        },
        {
          name: 'device',
          values: ['device1', 'device2'],
        },
      ],
      refId: 'A',
    });

    /**
     * Use Table
     */
    const { result } = renderHook(() =>
      useTable({
        data: { series: [dataFrame] } as any,
        options: {
          levels: [
            { name: 'country', source: 'A' },
            { name: 'device', source: 'A' },
          ],
        } as any,
        eventBus: null as any,
      })
    );

    expect(result.current.tableData).toEqual([
      expect.objectContaining({
        value: 'USA',
        selected: false,
        selectable: false,
        childValues: ['device1'],
        children: [
          expect.objectContaining({
            value: 'device1',
            selected: true,
          }),
        ],
      }),
      expect.objectContaining({
        value: 'Japan',
        selected: false,
        selectable: false,
        childValues: ['device2'],
        children: [
          expect.objectContaining({
            value: 'device2',
            selected: false,
          }),
        ],
      }),
    ]);
  });

  it('Should apply status', () => {
    const variable = {
      multi: true,
      includeAll: false,
      options: [
        {
          text: 'All',
          value: '__all',
          selected: false,
        },
        {
          text: 'device1',
          value: 'device1',
          selected: true,
        },
        {
          text: 'device2',
          value: 'device2',
          selected: false,
        },
      ],
    };
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable,
          getVariable: jest.fn(() => variable),
        } as any)
    );
    const dataFrame = toDataFrame({
      fields: [
        {
          name: 'country',
          values: ['USA', 'Japan'],
        },
        {
          name: 'device',
          values: ['device1', 'device2'],
        },
      ],
      refId: 'A',
    });

    const statusDataFrame = toDataFrame({
      fields: [
        {
          name: 'name',
          values: ['device1', 'device2'],
        },
        {
          name: 'last',
          values: [70, 81],
          display: (value: number) => ({ color: value > 80 ? 'red' : 'green' }),
        },
      ],
    });

    /**
     * Use Table
     */
    const { result } = renderHook(() =>
      useTable({
        data: { series: [dataFrame, statusDataFrame] } as any,
        options: {
          levels: [{ name: 'device', source: 'A' }],
          name: 'name',
          status: 'last',
        } as any,
        eventBus: null as any,
      })
    );

    expect(result.current.tableData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'device1',
          showStatus: true,
          statusColor: 'green',
        }),
        expect.objectContaining({
          value: 'device2',
          showStatus: true,
          statusColor: 'red',
        }),
      ])
    );
  });

  it('Should work if no variable', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: null,
        } as any)
    );

    /**
     * Use Table
     */
    const { result } = renderHook(() =>
      useTable({ data: { series: [] } as any, options: {} as any, eventBus: null as any })
    );

    expect(result.current.tableData).toEqual([]);
  });

  describe('Check Render Logic', () => {
    /**
     * Rows Component
     * @param data
     * @param columns
     * @param depth
     * @param getSubRows
     * @constructor
     */
    const Rows: React.FC<{
      data: TableItem[];
      columns: any[];
      depth?: number;
      getSubRows: (row: TableItem) => TableItem[] | undefined;
    }> = ({ data, columns, depth = 0, getSubRows }) => (
      <>
        {data.map((row) => {
          const subRows = getSubRows(row);
          return (
            <div key={`${depth}-${row.value}`}>
              <div>
                {columns[0].cell({
                  row: {
                    original: row,
                    depth,
                    getCanExpand: () => !!row.children,
                    getToggleExpandedHandler: () => {},
                    getIsExpanded: () => false,
                  },
                  getValue: () => row.value,
                })}
              </div>
              {subRows && <Rows data={subRows} columns={columns} depth={depth + 1} getSubRows={getSubRows} />}
            </div>
          );
        })}
      </>
    );

    it('Should select unselected values', () => {
      const deviceVariable = {
        multi: true,
        includeAll: true,
        options: [
          {
            text: 'All',
            value: '__all',
            selected: false,
          },
          {
            text: 'device1',
            value: 'device1',
            selected: false,
          },
          {
            text: 'device2',
            value: 'device2',
            selected: true,
          },
        ],
      };
      const countryVariable = {
        multi: true,
        options: [
          {
            text: 'USA',
            value: 'USA',
            selected: false,
          },
        ],
      };
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn((name: string) => (name === 'country' ? countryVariable : deviceVariable)),
          } as any)
      );
      const dataFrame = toDataFrame({
        fields: [
          {
            name: 'country',
            values: ['USA', 'Japan'],
          },
          {
            name: 'device',
            values: ['device1', 'device2'],
          },
        ],
        refId: 'A',
      });

      /**
       * Use Table
       */
      const { result } = renderHook(() =>
        useTable({
          data: { series: [dataFrame] } as any,
          options: {
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
          } as any,
          eventBus: null as any,
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TestIds.table.cell('device1', 1));

      /**
       * Check row presence
       */
      expect(device1).toBeInTheDocument();

      /**
       * Check if device1 is not selected
       */
      const device1Control = within(device1).getByTestId(TestIds.table.control);
      expect(device1Control).not.toBeChecked();

      /**
       * Check if device2 is selected
       */
      const device2Control = within(screen.getByTestId(TestIds.table.cell('device2', 1))).getByTestId(
        TestIds.table.control
      );
      expect(device2Control).toBeChecked();

      /**
       * Select device1
       */
      fireEvent.click(device1Control);

      expect(selectVariableValues).toHaveBeenCalledWith(['device1'], deviceVariable);
    });

    it('Should use radio for single value', () => {
      const variable = {
        multi: false,
        includeAll: false,
        options: [
          {
            text: 'device1',
            value: 'device1',
            selected: false,
          },
          {
            text: 'device2',
            value: 'device2',
            selected: true,
          },
        ],
      };
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable,
            getVariable: jest.fn(() => variable),
          } as any)
      );

      /**
       * Use Table
       */
      const { result } = renderHook(() =>
        useTable({
          data: { series: [] } as any,
          options: {
            levels: [],
          } as any,
          eventBus: null as any,
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TestIds.table.cell('device1', 0));

      /**
       * Check row presence
       */
      expect(device1).toBeInTheDocument();

      /**
       * Check if control is radio
       */
      const device1Control = within(device1).getByTestId(TestIds.table.control);
      expect(device1Control).toHaveAttribute('type', 'radio');
    });

    it('Row with subRows should not be selectable and expandable', () => {
      const variable = {
        multi: true,
        includeAll: true,
        options: [
          {
            text: 'All',
            value: '__all',
            selected: false,
          },
          {
            text: 'device1',
            value: 'device1',
            selected: true,
          },
        ],
      };
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable,
            getVariable: jest.fn(() => variable),
          } as any)
      );
      const dataFrame = toDataFrame({
        fields: [
          {
            name: 'country',
            values: ['USA', 'Japan'],
          },
          {
            name: 'device',
            values: ['device1', 'device2'],
          },
        ],
        refId: 'A',
      });

      /**
       * Use Table
       */
      const { result } = renderHook(() =>
        useTable({
          data: { series: [dataFrame] } as any,
          options: {
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
          } as any,
          eventBus: null as any,
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      /**
       * Check if country row is not selectable
       */
      const usaRow = screen.getByTestId(TestIds.table.cell('USA', 0));
      expect(usaRow).toBeInTheDocument();
      expect(within(usaRow).queryByTestId(TestIds.table.control)).not.toBeInTheDocument();

      /**
       * Check if country row is expandable
       */
      expect(within(usaRow).getByTestId(TestIds.table.buttonExpand)).toBeInTheDocument();

      /**
       * Check if device row is selectable and not expandable if value exists in variable options
       */
      const device1Row = screen.getByTestId(TestIds.table.cell('device1', 1));
      expect(device1Row).toBeInTheDocument();
      expect(within(device1Row).getByTestId(TestIds.table.control)).toBeInTheDocument();
      expect(within(device1Row).queryByTestId(TestIds.table.buttonExpand)).not.toBeInTheDocument();

      /**
       * Check if device row is not selectable if value does not exist in variable options
       */
      const device2Row = screen.getByTestId(TestIds.table.cell('device2', 1));
      expect(device2Row).toBeInTheDocument();
      expect(within(device2Row).queryByTestId(TestIds.table.control)).not.toBeInTheDocument();
      expect(within(device1Row).queryByTestId(TestIds.table.buttonExpand)).not.toBeInTheDocument();
    });

    describe('Favorites', () => {
      const deviceVariable = {
        multi: true,
        includeAll: true,
        name: 'device',
        options: [
          {
            text: 'All',
            value: '__all',
            selected: false,
          },
          {
            text: 'device1',
            value: 'device1',
            selected: false,
          },
          {
            text: 'device2',
            value: 'device2',
            selected: true,
          },
        ],
      };

      const favoritesMock = {
        add: jest.fn(),
        remove: jest.fn(),
        isAdded: jest.fn((name, value) => value === 'device1'),
      };
      jest.mocked(useFavorites).mockImplementation(() => favoritesMock);

      const dataFrame = toDataFrame({
        fields: [
          {
            name: 'device',
            values: ['device1', 'device2'],
          },
        ],
        refId: 'A',
      });

      beforeEach(() => {
        favoritesMock.add.mockClear();
        favoritesMock.remove.mockClear();
      });

      it('Show not show favorites control for All option', () => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn(() => deviceVariable),
            } as any)
        );
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [dataFrame] } as any,
            options: {
              levels: [{ name: 'device', source: 'A' }],
            } as any,
            eventBus: null as any,
          })
        );

        /**
         * Render rows
         */
        render(
          <Rows
            data={result.current.tableData}
            columns={result.current.columns}
            getSubRows={result.current.getSubRows}
          />
        );

        const rowAll = screen.getByTestId(TestIds.table.cell('All', 0));

        expect(rowAll).toBeInTheDocument();

        /**
         * All value can't be added to favorites
         */
        expect(within(rowAll).queryByTestId(TestIds.table.favoritesControl)).not.toBeInTheDocument();
      });

      it('Show show added to favorites control for device1', () => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn(() => deviceVariable),
            } as any)
        );
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [dataFrame] } as any,
            options: {
              levels: [{ name: 'device', source: 'A' }],
            } as any,
            eventBus: null as any,
          })
        );

        /**
         * Render rows
         */
        render(
          <Rows
            data={result.current.tableData}
            columns={result.current.columns}
            getSubRows={result.current.getSubRows}
          />
        );

        const rowDevice1 = screen.getByTestId(TestIds.table.cell('device1', 0));

        expect(rowDevice1).toBeInTheDocument();

        /**
         * Device can be removed to favorites
         */
        const favoritesControl = within(rowDevice1).getByTestId(TestIds.table.favoritesControl);
        expect(favoritesControl).toBeInTheDocument();

        /**
         * Remove device from favorites
         */
        fireEvent.click(favoritesControl);

        expect(favoritesMock.remove).toHaveBeenCalledWith('device', 'device1');
      });

      it('Show not added to favorites control for device1', () => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn(() => deviceVariable),
            } as any)
        );

        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [dataFrame] } as any,
            options: {
              levels: [{ name: 'device', source: 'A' }],
            } as any,
            eventBus: null as any,
          })
        );

        /**
         * Render rows
         */
        render(
          <Rows
            data={result.current.tableData}
            columns={result.current.columns}
            getSubRows={result.current.getSubRows}
          />
        );

        const rowDevice2 = screen.getByTestId(TestIds.table.cell('device2', 0));

        expect(rowDevice2).toBeInTheDocument();

        /**
         * Device can be added to favorites
         */
        const favoritesControl = within(rowDevice2).getByTestId(TestIds.table.favoritesControl);
        expect(favoritesControl).toBeInTheDocument();

        /**
         * Add to Favorites
         */
        fireEvent.click(favoritesControl);

        expect(favoritesMock.add).toHaveBeenCalledWith('device', 'device2');
      });
    });
  });
});

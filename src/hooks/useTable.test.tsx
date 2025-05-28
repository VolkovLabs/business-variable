import { FieldType, ThresholdsMode, toDataFrame, TypedVariableModel } from '@grafana/data';
import { fireEvent, render, renderHook, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER, TEST_IDS } from '../constants';
import { StatusStyleMode, TableItem, VariableType } from '../types';
import { createFavoritesConfig, createPanelOptions, getRuntimeVariable, selectVariableValues } from '../utils';
import { useFavorites } from './useFavorites';
import { useRuntimeVariables } from './useRuntimeVariables';
import { useTable } from './useTable';

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
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  selectVariableValues: jest.fn(),
}));

/**
 * In Test Ids
 */
const InTestIds = {
  headerRow: (id: string) => `data-testid table header-row-${id}`,
  row: (value: string, depth: number) => `data-testid table row-${depth}-${value}`,
};

describe('Use Table Hook', () => {
  /**
   * Create Runtime Variable Mock
   */
  const createRuntimeVariableMock = (variable: Partial<TypedVariableModel>) => {
    if (variable.type === VariableType.TEXTBOX) {
      return getRuntimeVariable(variable as any);
    }

    if (variable.type === VariableType.QUERY || variable.type === VariableType.CUSTOM) {
      return getRuntimeVariable({
        ...variable,
        current: {
          ...(variable.current || {}),
          value:
            variable.options?.filter((option) => option.selected).map(({ value }) => value.toString()) ||
            variable.current?.value ||
            [],
        } as any,
      } as any);
    }

    return getRuntimeVariable(variable as any);
  };

  beforeEach(() => {
    jest.mocked(selectVariableValues).mockClear();
    jest.mocked(useRuntimeVariables).mockReset();
  });

  it('Should return variable options if no levels', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: createRuntimeVariableMock({
            type: VariableType.CUSTOM,
            options: [
              {
                text: ALL_VALUE,
                value: ALL_VALUE_PARAMETER,
                selected: false,
              },
              {
                text: 'Option 1',
                value: 'option1',
                selected: true,
              },
              {
                text: 'Option 2',
                value: 'option2',
                selected: false,
              },
            ],
          } as any),
        }) as any
    );

    /**
     * Use Table
     */
    const { result } = renderHook(() =>
      useTable({
        data: { series: [] } as any,
        options: createPanelOptions(),
        eventBus: null as any,
        panelEventBus: null as any,
        replaceVariables: jest.fn(),
      })
    );

    expect(result.current.tableData).toEqual([
      expect.objectContaining({
        value: ALL_VALUE_PARAMETER,
        label: ALL_VALUE,
        selected: false,
        selectable: true,
      }),
      expect.objectContaining({
        value: 'option1',
        label: 'Option 1',
        selected: true,
        selectable: true,
      }),
      expect.objectContaining({
        value: 'option2',
        label: 'Option 2',
        selected: false,
        selectable: true,
      }),
    ]);
  });

  it('Should add All option for single level', () => {
    const variable = createRuntimeVariableMock({
      multi: true,
      includeAll: true,
      type: VariableType.CUSTOM,
      name: 'device',
      options: [
        {
          text: ALL_VALUE,
          value: ALL_VALUE_PARAMETER,
          selected: false,
        },
        {
          text: 'Device 1',
          value: 'device1',
          selected: true,
        },
        {
          text: 'Device 2',
          value: 'device2',
          selected: false,
        },
      ],
    } as any);
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable,
          getVariable: jest.fn(() => variable),
        }) as any
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
        options: createPanelOptions(),
        eventBus: null as any,
        levels: [{ name: 'device', source: 'A' }],
        panelEventBus: null as any,
        replaceVariables: jest.fn(),
      })
    );

    expect(result.current.tableData).toEqual([
      expect.objectContaining({
        value: ALL_VALUE_PARAMETER,
        selected: false,
        selectable: true,
        label: ALL_VALUE,
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
    const deviceVariable = createRuntimeVariableMock({
      multi: true,
      includeAll: true,
      type: VariableType.CUSTOM,
      options: [
        {
          text: ALL_VALUE,
          value: ALL_VALUE_PARAMETER,
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
    } as any);
    const countryVariable = createRuntimeVariableMock({
      multi: true,
      name: 'country',
      type: VariableType.CUSTOM,
      options: [
        {
          text: 'USA',
          value: 'country1',
          selected: false,
        },
        {
          text: 'Japan',
          value: 'country2',
          selected: false,
        },
      ],
    } as any);
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: deviceVariable,
          getVariable: jest.fn((name: string) => (name === 'country' ? countryVariable : deviceVariable)),
        }) as any
    );
    const dataFrame = toDataFrame({
      fields: [
        {
          name: 'country',
          values: ['country1', 'country2'],
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
        eventBus: null as any,
        options: createPanelOptions(),
        levels: [
          { name: 'country', source: 'A' },
          { name: 'device', source: 'A' },
        ],
        panelEventBus: null as any,
        replaceVariables: jest.fn(),
      })
    );

    expect(result.current.tableData).toEqual([
      expect.objectContaining({
        value: 'country1',
        label: 'USA',
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
        value: 'country2',
        label: 'Japan',
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
    const variable = createRuntimeVariableMock({
      multi: true,
      includeAll: false,
      type: VariableType.CUSTOM,
      options: [
        {
          text: ALL_VALUE,
          value: ALL_VALUE_PARAMETER,
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
    } as any);
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable,
          getVariable: jest.fn(() => variable),
        }) as any
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
        options: createPanelOptions({
          name: 'name',
          status: 'last',
        }),
        eventBus: null as any,
        levels: [{ name: 'device', source: 'A' }],
        panelEventBus: null as any,
        replaceVariables: jest.fn(),
      })
    );

    expect(result.current.tableData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          value: 'device1',
          showStatus: true,
          statusColor: 'green',
          statusMode: StatusStyleMode.COLOR,
        }),
        expect.objectContaining({
          value: 'device2',
          showStatus: true,
          statusColor: 'red',
          statusMode: StatusStyleMode.COLOR,
        }),
      ])
    );
  });

  it('Should work if no variable', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: null,
          getVariable: jest.fn(),
        }) as any
    );

    /**
     * Use Table
     */
    const { result } = renderHook(() =>
      useTable({
        data: { series: [] } as any,
        options: createPanelOptions(),
        eventBus: null as any,
        panelEventBus: null as any,
        replaceVariables: jest.fn(),
      })
    );

    expect(result.current.tableData).toEqual([]);
  });

  describe('Check Render Logic', () => {
    /**
     * Table Header
     * @param columns
     * @param table
     * @constructor
     */
    const TableHeader = ({ columns, table }: { columns: any[]; table: any }) => (
      <>
        {columns.map((column) => (
          <div key={column.id} data-testid={InTestIds.headerRow(column.id)}>
            {typeof column.header === 'function' ? column.header({ table }) : column.header}
          </div>
        ))}
      </>
    );

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
        {data.map((row, index) => {
          const subRows = getSubRows(row);
          return (
            <React.Fragment key={`${depth}-${row.value}`}>
              <div data-testid={InTestIds.row(row.value, depth)}>
                <div>
                  {columns[0].cell({
                    row: {
                      original: row,
                      depth,
                      getCanExpand: () => !!row.children,
                      getToggleExpandedHandler: () => () => {},
                      getIsExpanded: () => index % 2 === 0,
                    },
                    getValue: () => row.value,
                  })}
                  {columns[1]?.cell({
                    row: {
                      original: row,
                      depth,
                    },
                    getValue: () => row.isFavorite,
                  })}
                </div>
              </div>
              {subRows && <Rows data={subRows} columns={columns} depth={depth + 1} getSubRows={getSubRows} />}
            </React.Fragment>
          );
        })}
      </>
    );

    it('Should show status color', () => {
      const deviceVariable = createRuntimeVariableMock({
        multi: true,
        includeAll: true,
        type: VariableType.CUSTOM,
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
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn(() => deviceVariable),
          }) as any
      );
      const dataFrame = toDataFrame({
        fields: [
          {
            name: 'device',
            values: ['device1', 'device2'],
          },
          {
            name: 'temp',
            type: FieldType.number,
            values: [10, 60],
            display: (value: never) => value,
            config: {
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  {
                    value: 60,
                    color: 'red',
                  },
                  {
                    value: Infinity,
                    color: 'green',
                  },
                ],
              },
            },
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
          options: createPanelOptions({
            favorites: createFavoritesConfig({
              enabled: true,
            }),
            status: 'temp',
            variable: 'device',
            name: 'device',
          }),
          eventBus: null as any,
          levels: [],
          panelEventBus: {} as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TEST_IDS.table.cell('device1', 0));

      /**
       * Check status presence
       */
      expect(device1).toBeInTheDocument();
      expect(within(device1).getByTestId(TEST_IDS.table.statusColor)).toBeInTheDocument();
    });

    it('Should show status image', () => {
      const deviceVariable = createRuntimeVariableMock({
        multi: true,
        includeAll: true,
        type: VariableType.CUSTOM,
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
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn(() => deviceVariable),
          }) as any
      );
      const dataFrame = toDataFrame({
        fields: [
          {
            name: 'device',
            values: ['device1', 'device2'],
          },
          {
            name: 'temp',
            type: FieldType.number,
            values: [90, 60],
            display: (value: never) => value,
            config: {
              thresholds: {
                mode: ThresholdsMode.Absolute,
                steps: [
                  {
                    value: 60,
                    color: 'red',
                  },
                  {
                    value: Infinity,
                    color: 'green',
                  },
                ],
              },
              custom: {
                thresholdsStyle: {
                  mode: StatusStyleMode.IMAGE,
                  thresholds: [
                    {
                      value: 60,
                      image: '60.png',
                    },
                    {
                      value: 0,
                      image: '0.png',
                    },
                  ],
                },
              },
            },
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
          options: createPanelOptions({
            favorites: createFavoritesConfig({
              enabled: true,
            }),
            status: 'temp',
            variable: 'device',
            name: 'device',
          }),
          eventBus: null as any,
          levels: [],
          panelEventBus: {} as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TEST_IDS.table.cell('device1', 0));

      /**
       * Check status presence
       */
      expect(device1).toBeInTheDocument();
      expect(within(device1).getByTestId(TEST_IDS.table.statusImage)).toBeInTheDocument();
      expect(within(device1).getByTestId(TEST_IDS.table.statusImage)).toHaveProperty('src', 'http://localhost/60.png');
    });

    it('Should select unselected values', () => {
      const deviceVariable = createRuntimeVariableMock({
        multi: true,
        includeAll: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: ALL_VALUE,
            value: ALL_VALUE_PARAMETER,
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
      } as any);
      const countryVariable = createRuntimeVariableMock({
        multi: true,
        options: [
          {
            text: 'USA',
            value: 'USA',
            selected: false,
          },
        ],
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn((name: string) => (name === 'country' ? countryVariable : deviceVariable)),
          }) as any
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
          options: createPanelOptions({
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [
            { name: 'country', source: 'A' },
            { name: 'device', source: 'A' },
          ],
          panelEventBus: {} as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TEST_IDS.table.cell('device1', 1));

      /**
       * Check row presence
       */
      expect(device1).toBeInTheDocument();

      /**
       * Check if device1 is not selected
       */
      const device1Control = within(device1).getByTestId(TEST_IDS.table.control);
      expect(device1Control).not.toBeChecked();

      /**
       * Check if device2 is selected
       */
      const device2Control = within(screen.getByTestId(TEST_IDS.table.cell('device2', 1))).getByTestId(
        TEST_IDS.table.control
      );
      expect(device2Control).toBeChecked();

      /**
       * Select device1
       */
      fireEvent.click(device1Control);

      expect(selectVariableValues).toHaveBeenCalledWith({
        values: ['device1'],
        runtimeVariable: deviceVariable,
        panelEventBus: expect.anything(),
        isKeepSelection: false,
      });

      jest.mocked(selectVariableValues).mockClear();

      /**
       * Should select values by clicking on label
       */
      fireEvent.click(within(device1).getByTestId(TEST_IDS.table.label));

      expect(selectVariableValues).toHaveBeenCalledWith({
        values: ['device1'],
        runtimeVariable: deviceVariable,
        panelEventBus: expect.anything(),
        isKeepSelection: false,
      });
    });

    it('Should select unselected parent values', () => {
      const deviceVariable = createRuntimeVariableMock({
        multi: true,
        includeAll: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: ALL_VALUE,
            value: ALL_VALUE_PARAMETER,
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
            selected: false,
          },
        ],
      } as any);
      const countryVariable = createRuntimeVariableMock({
        multi: true,
        name: 'country',
        type: VariableType.CUSTOM,
        options: [
          {
            text: 'USA',
            value: 'USA',
            selected: false,
          },
          {
            text: 'Japan',
            value: 'Japan',
            selected: false,
          },
        ],
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn((name: string) => (name === 'country' ? countryVariable : deviceVariable)),
          }) as any
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
          options: createPanelOptions({
            groupSelection: true,
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [
            { name: 'country', source: 'A' },
            { name: 'device', source: 'A' },
          ],
          panelEventBus: {} as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const country = screen.getByTestId(TEST_IDS.table.cell('Japan', 0));

      /**
       * Check row presence
       */
      expect(country).toBeInTheDocument();

      /**
       * Check if Japan is not selected
       */
      const countryControl = within(country).getByTestId(TEST_IDS.table.control);
      expect(countryControl).not.toBeChecked();

      /**
       * Select country
       */
      fireEvent.click(countryControl);

      expect(selectVariableValues).toHaveBeenCalledTimes(2);
      expect(selectVariableValues).toHaveBeenCalledWith({
        values: ['device2'],
        runtimeVariable: deviceVariable,
        panelEventBus: expect.anything(),
        isKeepSelection: false,
      });
      expect(selectVariableValues).toHaveBeenCalledWith({
        values: ['Japan'],
        runtimeVariable: countryVariable,
        panelEventBus: expect.anything(),
        isKeepSelection: false,
      });
    });

    it('Should use radio for single value', () => {
      const variable = createRuntimeVariableMock({
        multi: false,
        includeAll: false,
        type: VariableType.CUSTOM,
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
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable,
            getVariable: jest.fn(() => variable),
          }) as any
      );

      /**
       * Use Table
       */
      const { result } = renderHook(() =>
        useTable({
          data: { series: [] } as any,
          options: createPanelOptions({
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [],
          panelEventBus: null as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TEST_IDS.table.cell('device1', 0));

      /**
       * Check row presence
       */
      expect(device1).toBeInTheDocument();

      /**
       * Check if control is radio
       */
      const device1Control = within(device1).getByTestId(TEST_IDS.table.control);
      expect(device1Control).toHaveAttribute('type', 'radio');
    });

    it('Should select value if single all value is selected', () => {
      const variable = createRuntimeVariableMock({
        multi: false,
        includeAll: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: ALL_VALUE,
            value: ALL_VALUE_PARAMETER,
            selected: true,
          },
          {
            text: 'device1',
            value: 'device1',
            selected: true,
          },
          {
            text: 'device2',
            value: 'device2',
            selected: true,
          },
        ],
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable,
            getVariable: jest.fn(() => variable),
          }) as any
      );

      /**
       * Use Table
       */
      const { result } = renderHook(() =>
        useTable({
          data: { series: [] } as any,
          options: createPanelOptions({
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [],
          panelEventBus: {} as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TEST_IDS.table.cell('device1', 0));

      /**
       * Check row presence
       */
      expect(device1).toBeInTheDocument();

      /**
       * Select device 1
       */
      const device1Control = within(device1).getByTestId(TEST_IDS.table.control);

      fireEvent.click(device1Control);

      expect(selectVariableValues).toHaveBeenCalledWith({
        values: ['device1'],
        runtimeVariable: variable,
        panelEventBus: expect.anything(),
        isKeepSelection: false,
      });
    });

    it('Should select other values except selected with ctrl button pressed if all is active', async () => {
      const variable = createRuntimeVariableMock({
        multi: false,
        includeAll: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: ALL_VALUE,
            value: ALL_VALUE_PARAMETER,
            selected: true,
          },
          {
            text: 'device1',
            value: 'device1',
            selected: true,
          },
          {
            text: 'device2',
            value: 'device2',
            selected: true,
          },
          {
            text: 'device3',
            value: 'device3',
            selected: true,
          },
        ],
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable,
            getVariable: jest.fn(() => variable),
          }) as any
      );

      /**
       * Use Table
       */
      const { result } = renderHook(() =>
        useTable({
          data: { series: [] } as any,
          options: createPanelOptions({
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [],
          panelEventBus: {} as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TEST_IDS.table.cell('device1', 0));

      /**
       * Check row presence
       */
      expect(device1).toBeInTheDocument();

      /**
       * Select device 1
       */
      const device1Control = within(device1).getByTestId(TEST_IDS.table.control);

      const user = userEvent.setup();

      /**
       * Press ctrl
       */
      await user.keyboard('[ControlLeft>]');

      /**
       * Click with ctrl pressed
       */
      await user.click(device1Control);

      /**
       * Check if value should be selected with keep selection active
       */
      expect(selectVariableValues).toHaveBeenCalledWith({
        values: ['device1'],
        runtimeVariable: variable,
        panelEventBus: expect.anything(),
        isKeepSelection: true,
      });
    });

    it('Row with subRows should not be selectable and expandable', () => {
      const variable = createRuntimeVariableMock({
        multi: true,
        includeAll: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: ALL_VALUE,
            value: ALL_VALUE_PARAMETER,
            selected: false,
          },
          {
            text: 'device1',
            value: 'device1',
            selected: true,
          },
        ],
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable,
            getVariable: jest.fn(() => variable),
          }) as any
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
          options: createPanelOptions({
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [
            { name: 'country', source: 'A' },
            { name: 'device', source: 'A' },
          ],
          panelEventBus: null as any,
          replaceVariables: jest.fn(),
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
      const usaRow = screen.getByTestId(TEST_IDS.table.cell('USA', 0));
      expect(usaRow).toBeInTheDocument();
      expect(within(usaRow).queryByTestId(TEST_IDS.table.control)).not.toBeInTheDocument();

      /**
       * Check if label clicking doesn't update values
       */
      fireEvent.click(within(usaRow).getByTestId(TEST_IDS.table.label));

      expect(selectVariableValues).not.toHaveBeenCalled();

      /**
       * Check if country row is expandable
       */
      expect(within(usaRow).getByTestId(TEST_IDS.table.buttonExpand)).toBeInTheDocument();

      /**
       * Check if device row is selectable and not expandable if value exists in variable options
       */
      const device1Row = screen.getByTestId(TEST_IDS.table.cell('device1', 1));
      expect(device1Row).toBeInTheDocument();
      expect(within(device1Row).getByTestId(TEST_IDS.table.control)).toBeInTheDocument();
      expect(within(device1Row).queryByTestId(TEST_IDS.table.buttonExpand)).not.toBeInTheDocument();

      /**
       * Check if unselectable device2 row doesn't exist
       */
      expect(screen.queryByTestId(TEST_IDS.table.cell('device2', 1))).not.toBeInTheDocument();
    });

    it('Should show variable names', () => {
      const deviceVariable = createRuntimeVariableMock({
        multi: true,
        includeAll: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: ALL_VALUE,
            value: ALL_VALUE_PARAMETER,
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
      } as any);
      const countryVariable = createRuntimeVariableMock({
        multi: true,
        options: [
          {
            text: 'USA',
            value: 'USA',
            selected: false,
          },
        ],
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn((name: string) => (name === 'country' ? countryVariable : deviceVariable)),
          }) as any
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
          options: createPanelOptions({
            showName: true,
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [
            { name: 'country', source: 'A' },
            { name: 'device', source: 'A' },
          ],
          panelEventBus: null as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TEST_IDS.table.cell('device1', 1));

      /**
       * Check row presence
       */
      expect(device1).toBeInTheDocument();

      /**
       * Check if name is shown
       */
      expect(within(device1).getByText('device: device1')).toBeInTheDocument();
    });

    it('Should show Group Count', () => {
      const deviceVariable = createRuntimeVariableMock({
        multi: true,
        includeAll: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: ALL_VALUE,
            value: ALL_VALUE_PARAMETER,
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
      } as any);
      const countryVariable = createRuntimeVariableMock({
        multi: true,
        options: [
          {
            text: 'USA',
            value: 'USA',
            selected: false,
          },
        ],
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn((name: string) => (name === 'country' ? countryVariable : deviceVariable)),
          }) as any
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
          options: createPanelOptions({
            showName: true,
            groupSelection: true,
            showGroupTotal: true,
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [
            { name: 'country', source: 'A' },
            { name: 'device', source: 'A' },
          ],
          panelEventBus: null as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      expect(screen.getByTestId(TEST_IDS.table.groupCount('Japan'))).toBeInTheDocument();
    });

    it('Should work for text variable', () => {
      const deviceVariable = createRuntimeVariableMock({
        type: VariableType.TEXTBOX,
        current: {
          value: '123',
        },
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn(() => deviceVariable),
          }) as any
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
          options: createPanelOptions({
            showName: true,
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [{ name: 'device', source: 'A' }],
          panelEventBus: null as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TEST_IDS.table.cell('123', 0));

      /**
       * Check row presence
       */
      expect(device1).toBeInTheDocument();
    });

    it('Should work for text variable without value', () => {
      const deviceVariable = createRuntimeVariableMock({
        type: VariableType.TEXTBOX,
        current: {},
      } as any);
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn(() => deviceVariable),
          }) as any
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
          options: createPanelOptions({
            showName: true,
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [{ name: 'device', source: 'A' }],
          panelEventBus: null as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      const device1 = screen.getByTestId(TEST_IDS.table.cell('', 0));

      /**
       * Check row presence
       */
      expect(device1).toBeInTheDocument();
    });

    it('Should work for not supported variable', () => {
      const deviceVariable = {
        type: VariableType.ADHOC,
        current: {
          value: '123',
        },
      };
      jest.mocked(useRuntimeVariables).mockImplementation(
        () =>
          ({
            variable: deviceVariable,
            getVariable: jest.fn(() => deviceVariable),
          }) as any
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
          options: createPanelOptions({
            showName: true,
            favorites: createFavoritesConfig({
              enabled: true,
            }),
          }),
          eventBus: null as any,
          levels: [{ name: 'device', source: 'A' }],
          panelEventBus: null as any,
          replaceVariables: jest.fn(),
        })
      );

      /**
       * Render rows
       */
      const { container } = render(
        <Rows data={result.current.tableData} columns={result.current.columns} getSubRows={result.current.getSubRows} />
      );

      expect(container.querySelector('div')).not.toBeInTheDocument();
    });

    describe('Favorites', () => {
      const deviceVariable = createRuntimeVariableMock({
        multi: true,
        includeAll: true,
        name: 'device',
        type: VariableType.CUSTOM,
        options: [
          {
            text: ALL_VALUE,
            value: ALL_VALUE_PARAMETER,
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
      } as any);

      const countryVariable = createRuntimeVariableMock({
        multi: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: 'USA',
            value: 'USA',
            selected: false,
          },
          {
            text: 'Japan',
            value: 'Japan',
            selected: false,
          },
        ],
      } as any);

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
          {
            name: 'country',
            values: ['USA', 'Japan'],
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
            }) as any
        );
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [dataFrame] } as any,
            options: createPanelOptions({
              favorites: createFavoritesConfig({
                enabled: true,
              }),
            }),
            eventBus: null as any,
            levels: [{ name: 'device', source: 'A' }],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
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

        const rowAll = screen.getByTestId(InTestIds.row(ALL_VALUE_PARAMETER, 0));

        expect(rowAll).toBeInTheDocument();

        /**
         * All value can't be added to favorites
         */
        expect(within(rowAll).queryByTestId(TEST_IDS.table.favoritesControl)).not.toBeInTheDocument();
      });

      it('Show add to favorites selectable row', () => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn(() => deviceVariable),
            }) as any
        );
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [dataFrame] } as any,
            options: createPanelOptions({
              favorites: createFavoritesConfig({
                enabled: true,
              }),
            }),
            eventBus: null as any,
            levels: [{ name: 'device', source: 'A' }],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
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

        const rowDevice1 = screen.getByTestId(InTestIds.row('device1', 0));

        expect(rowDevice1).toBeInTheDocument();

        /**
         * Device can be removed to favorites
         */
        const favoritesControl = within(rowDevice1).getByTestId(TEST_IDS.table.favoritesControl);
        expect(favoritesControl).toBeInTheDocument();

        /**
         * Remove device from favorites
         */
        fireEvent.click(favoritesControl);

        expect(favoritesMock.remove).toHaveBeenCalledWith('device', 'device1');
      });

      it('Should not show favorites column if disabled', () => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn(() => deviceVariable),
            }) as any
        );
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [dataFrame] } as any,
            options: createPanelOptions({
              favorites: createFavoritesConfig({
                enabled: false,
              }),
            }),
            eventBus: null as any,
            levels: [{ name: 'device', source: 'A' }],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
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

        const rowDevice1 = screen.getByTestId(InTestIds.row('device1', 0));

        expect(rowDevice1).toBeInTheDocument();

        /**
         * Device can be removed to favorites
         */
        const favoritesControl = within(rowDevice1).queryByTestId(TEST_IDS.table.favoritesControl);
        expect(favoritesControl).toBeNull();
      });

      it('Show remove from favorites selectable row', () => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn(() => deviceVariable),
            }) as any
        );

        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [dataFrame] } as any,
            options: createPanelOptions({
              favorites: createFavoritesConfig({
                enabled: true,
              }),
            }),
            eventBus: null as any,
            levels: [{ name: 'device', source: 'A' }],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
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

        const rowDevice2 = screen.getByTestId(InTestIds.row('device2', 0));

        expect(rowDevice2).toBeInTheDocument();

        /**
         * Device can be added to favorites
         */
        const favoritesControl = within(rowDevice2).getByTestId(TEST_IDS.table.favoritesControl);
        expect(favoritesControl).toBeInTheDocument();

        /**
         * Add to Favorites
         */
        fireEvent.click(favoritesControl);

        expect(favoritesMock.add).toHaveBeenCalledWith('device', 'device2');
      });

      it('Show not allow to add to favorites group', () => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn((name) => (name === deviceVariable?.name ? deviceVariable : countryVariable)),
            }) as any
        );

        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [dataFrame] } as any,
            options: createPanelOptions({
              showName: true,
              favorites: createFavoritesConfig({
                enabled: true,
              }),
            }),
            eventBus: null as any,
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
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

        const rowCountry = screen.getByTestId(InTestIds.row('USA', 0));

        expect(rowCountry).toBeInTheDocument();

        /**
         * Group can't be added to favorites
         */
        const favoritesControl = within(rowCountry).queryByTestId(TEST_IDS.table.favoritesControl);
        expect(favoritesControl).not.toBeInTheDocument();
      });

      it('Should return selected column', () => {
        const deviceVariable = createRuntimeVariableMock({
          multi: true,
          includeAll: true,
          name: 'device',
          type: VariableType.CUSTOM,
          options: [
            {
              text: ALL_VALUE,
              value: ALL_VALUE_PARAMETER,
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
        } as any);

        const dataFrame = toDataFrame({
          fields: [
            {
              name: 'device',
              values: ['device1', 'device2'],
            },
            {
              name: 'country',
              values: ['USA', 'Japan'],
            },
          ],
          refId: 'A',
        });

        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn(() => deviceVariable),
            }) as any
        );
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [dataFrame] } as any,
            options: createPanelOptions({
              selectedValues: {
                showSelected: true,
              },
              favorites: createFavoritesConfig({
                enabled: false,
              }),
            }),
            eventBus: null as any,
            levels: [{ name: 'device', source: 'A' }],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
          })
        );

        const selectedColumn = result.current.columns[1];

        expect(selectedColumn).toEqual(
          expect.objectContaining({
            id: 'selected',
            accessorKey: 'selected',
            enableColumnFilter: true,
            cell: expect.any(Function),
          })
        );

        render(
          <Rows
            data={result.current.tableData}
            columns={result.current.columns}
            getSubRows={result.current.getSubRows}
          />
        );

        const rowDevice1 = screen.getByTestId(InTestIds.row('device1', 0));

        expect(rowDevice1).toBeInTheDocument();
      });
    });

    describe('Header', () => {
      const deviceVariable = createRuntimeVariableMock({
        multi: true,
        includeAll: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: ALL_VALUE,
            value: ALL_VALUE_PARAMETER,
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
            selected: false,
          },
        ],
      } as any);
      const countryVariable = createRuntimeVariableMock({
        multi: true,
        type: VariableType.CUSTOM,
        options: [
          {
            text: 'USA',
            value: 'USA',
            selected: false,
          },
          {
            text: 'Japan',
            value: 'Japan',
            selected: false,
          },
        ],
      } as any);

      beforeEach(() => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn((name: string) => (name === 'country' ? countryVariable : deviceVariable)),
            }) as any
        );
        jest.mocked(selectVariableValues).mockClear();
      });

      it('Should render expand all button', () => {
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [] } as any,
            options: createPanelOptions({
              header: true,
            }),
            eventBus: null as any,
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
          })
        );

        const toggleAllRows = jest.fn();

        /**
         * Render header
         */
        render(
          <TableHeader
            columns={result.current.columns}
            table={{
              getCanSomeRowsExpand: () => true,
              getToggleAllRowsExpandedHandler: () => toggleAllRows,
              getIsAllRowsExpanded: () => true,
            }}
          />
        );

        const valueHeader = screen.getByTestId(InTestIds.headerRow('value'));
        expect(valueHeader).toBeInTheDocument();

        const buttonExpandAll = within(valueHeader).getByTestId(TEST_IDS.table.buttonExpandAll);
        expect(buttonExpandAll).toBeInTheDocument();
        expect(within(buttonExpandAll).getByTestId('angle-double-down')).toBeInTheDocument();

        fireEvent.click(buttonExpandAll);

        expect(toggleAllRows).toHaveBeenCalled();
      });

      it('Should render count text', () => {
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [] } as any,
            options: createPanelOptions({
              header: true,
              showTotal: true,
            }),
            eventBus: null as any,
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
          })
        );

        const toggleAllRows = jest.fn();

        /**
         * Render header
         */
        render(
          <TableHeader
            columns={result.current.columns}
            table={{
              getCanSomeRowsExpand: () => true,
              getToggleAllRowsExpandedHandler: () => toggleAllRows,
              getIsAllRowsExpanded: () => true,
            }}
          />
        );

        expect(screen.getByTestId(TEST_IDS.table.headerGroupCount)).toBeInTheDocument();
      });

      it('Should render correct count text with All', () => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: createRuntimeVariableMock({
                type: VariableType.CUSTOM,
                multi: true,
                options: [
                  {
                    text: ALL_VALUE,
                    value: ALL_VALUE_PARAMETER,
                    selected: true,
                  },
                  {
                    text: 'Option 1',
                    value: 'option1',
                    selected: true,
                  },
                  {
                    text: 'Option 2',
                    value: 'option2',
                    selected: true,
                  },
                ],
              } as any),
            }) as any
        );

        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [] } as any,
            options: createPanelOptions({
              header: true,
              showTotal: true,
            }),
            eventBus: null as any,
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
          })
        );

        const toggleAllRows = jest.fn();

        /**
         * Render header
         */
        render(
          <TableHeader
            columns={result.current.columns}
            table={{
              getCanSomeRowsExpand: () => true,
              getToggleAllRowsExpandedHandler: () => toggleAllRows,
              getIsAllRowsExpanded: () => true,
            }}
          />
        );

        const spanElement = screen.getByTestId(TEST_IDS.table.headerGroupCount);
        expect(spanElement).toBeInTheDocument();
        expect(spanElement).toHaveTextContent('(2/2 selected)');
      });

      it('Should render correct count text without All', () => {
        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: createRuntimeVariableMock({
                type: VariableType.CUSTOM,
                multi: true,
                options: [
                  {
                    text: 'Option 1',
                    value: 'option1',
                    selected: true,
                  },
                  {
                    text: 'Option 2',
                    value: 'option2',
                    selected: false,
                  },
                ],
              } as any),
            }) as any
        );

        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [] } as any,
            options: createPanelOptions({
              header: true,
              showTotal: true,
            }),
            eventBus: null as any,
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
          })
        );

        const toggleAllRows = jest.fn();

        /**
         * Render header
         */
        render(
          <TableHeader
            columns={result.current.columns}
            table={{
              getCanSomeRowsExpand: () => true,
              getToggleAllRowsExpandedHandler: () => toggleAllRows,
              getIsAllRowsExpanded: () => true,
            }}
          />
        );

        const spanElement = screen.getByTestId(TEST_IDS.table.headerGroupCount);
        expect(spanElement).toBeInTheDocument();
        expect(spanElement).toHaveTextContent('(1/2 selected)');
      });

      it('Should show current expand state', () => {
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [] } as any,
            options: createPanelOptions({
              header: true,
            }),
            eventBus: null as any,
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
          })
        );

        const toggleAllRows = jest.fn();

        /**
         * Render header
         */
        render(
          <TableHeader
            columns={result.current.columns}
            table={{
              getCanSomeRowsExpand: () => true,
              getToggleAllRowsExpandedHandler: () => toggleAllRows,
              getIsAllRowsExpanded: () => false,
            }}
          />
        );

        const valueHeader = screen.getByTestId(InTestIds.headerRow('value'));
        expect(valueHeader).toBeInTheDocument();

        const buttonExpandAll = within(valueHeader).getByTestId(TEST_IDS.table.buttonExpandAll);
        expect(buttonExpandAll).toBeInTheDocument();
        expect(within(buttonExpandAll).getByTestId('angle-double-right')).toBeInTheDocument();
      });

      it('Should not render expand all button', () => {
        /**
         * Use Table
         */
        const { result } = renderHook(() =>
          useTable({
            data: { series: [] } as any,
            options: createPanelOptions({
              header: true,
            }),
            eventBus: null as any,
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
            panelEventBus: null as any,
            replaceVariables: jest.fn(),
          })
        );

        /**
         * Render header
         */
        render(
          <TableHeader
            columns={result.current.columns}
            table={{
              getCanSomeRowsExpand: () => false,
              getToggleAllRowsExpandedHandler: () => undefined,
              getIsAllRowsExpanded: () => true,
            }}
          />
        );

        const valueHeader = screen.getByTestId(InTestIds.headerRow('value'));
        expect(valueHeader).toBeInTheDocument();

        expect(within(valueHeader).queryByTestId(TEST_IDS.table.buttonExpandAll)).not.toBeInTheDocument();
      });

      it('Should select all child items ', () => {
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
            options: createPanelOptions({
              header: true,
              groupSelection: true,
            }),
            eventBus: null as any,
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
            panelEventBus: {} as any,
            replaceVariables: jest.fn(),
          })
        );

        /**
         * Render header
         */
        render(
          <TableHeader
            columns={result.current.columns}
            table={{
              getIsAllRowsSelected: () => true,
              getCanSomeRowsExpand: () => true,
              getToggleAllRowsExpandedHandler: () => jest.fn(),
              getIsAllRowsExpanded: () => true,
            }}
          />
        );

        const valueHeader = screen.getByTestId(InTestIds.headerRow('value'));
        expect(valueHeader).toBeInTheDocument();

        const selectAllControl = within(valueHeader).getByTestId(TEST_IDS.table.allControl);
        expect(selectAllControl).toBeInTheDocument();

        fireEvent.click(selectAllControl);

        /**
         * Should select country
         */
        expect(selectVariableValues).toHaveBeenCalledTimes(2);
        expect(selectVariableValues).toHaveBeenCalledWith({
          values: ['USA', 'Japan'],
          runtimeVariable: countryVariable,
          panelEventBus: expect.anything(),
          isKeepSelection: false,
        });
        expect(selectVariableValues).toHaveBeenCalledWith({
          values: ['device1', 'device2'],
          runtimeVariable: deviceVariable,
          panelEventBus: expect.anything(),
          isKeepSelection: false,
        });
      });

      it('Should render calculated all state by selected child items and unselect them', () => {
        const deviceVariable = createRuntimeVariableMock({
          multi: true,
          includeAll: true,
          type: VariableType.CUSTOM,
          options: [
            {
              text: ALL_VALUE,
              value: ALL_VALUE_PARAMETER,
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
              selected: true,
            },
          ],
        } as any);
        const countryVariable = createRuntimeVariableMock({
          multi: true,
          type: VariableType.CUSTOM,
          options: [
            {
              text: 'USA',
              value: 'USA',
              selected: true,
            },
            {
              text: 'Japan',
              value: 'Japan',
              selected: true,
            },
          ],
        } as any);

        jest.mocked(useRuntimeVariables).mockImplementation(
          () =>
            ({
              variable: deviceVariable,
              getVariable: jest.fn((name: string) => (name === 'country' ? countryVariable : deviceVariable)),
            }) as any
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
            options: createPanelOptions({
              header: true,
              groupSelection: true,
            }),
            eventBus: null as any,
            levels: [
              { name: 'country', source: 'A' },
              { name: 'device', source: 'A' },
            ],
            panelEventBus: {} as any,
            replaceVariables: jest.fn(),
          })
        );

        /**
         * Render header
         */
        render(
          <TableHeader
            columns={result.current.columns}
            table={{
              getIsAllRowsSelected: () => true,
              getCanSomeRowsExpand: () => true,
              getToggleAllRowsExpandedHandler: () => jest.fn(),
              getIsAllRowsExpanded: () => true,
            }}
          />
        );

        const valueHeader = screen.getByTestId(InTestIds.headerRow('value'));
        expect(valueHeader).toBeInTheDocument();

        /**
         * Check if all selected
         */
        const selectAllControl = within(valueHeader).getByTestId(TEST_IDS.table.allControl);
        expect(selectAllControl).toBeInTheDocument();
        expect(selectAllControl).toBeChecked();

        /**
         * Unselect all
         */
        fireEvent.click(selectAllControl);

        /**
         * Check if all items unselected
         */

        expect(selectVariableValues).toHaveBeenCalledWith({
          values: ['device1', 'device2'],
          runtimeVariable: deviceVariable,
          panelEventBus: expect.anything(),
          isKeepSelection: false,
        });
        expect(selectVariableValues).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('Should return array of values in childValues instead label', () => {
    const deviceVariable = createRuntimeVariableMock({
      multi: true,
      includeAll: true,
      type: VariableType.CUSTOM,
      options: [
        {
          text: ALL_VALUE,
          value: ALL_VALUE_PARAMETER,
          selected: false,
        },
        {
          text: 'Device Text 10',
          value: 'device10',
          selected: true,
        },
        {
          text: 'Device Text 20',
          value: 'device20',
          selected: true,
        },
      ],
    } as any);

    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: deviceVariable,
          getVariable: jest.fn(() => deviceVariable),
        }) as any
    );
    const dataFrame = toDataFrame({
      fields: [
        {
          name: 'device',
          values: ['device10', 'device20'],
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
        eventBus: null as any,
        options: createPanelOptions(),
        levels: [
          { name: 'Top Level', source: 'A' },
          { name: 'device', source: 'A' },
        ],
        panelEventBus: null as any,
        replaceVariables: jest.fn(),
      })
    );
    const { childValues } = result.current.tableData[0];

    expect(childValues).toEqual(['device10', 'device20']);
    expect(childValues).not.toEqual(['Device Text 10', 'Device Text 20']);
  });
});

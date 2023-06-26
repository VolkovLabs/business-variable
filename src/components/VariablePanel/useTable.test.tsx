import React from 'react';
import { toDataFrame } from '@grafana/data';
import { renderHook, render, screen, fireEvent, within } from '@testing-library/react';
import { TestIds } from '../../constants';
import { TableItem } from '../../types';
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
    const Rows: React.FC<{ data: TableItem[]; columns: any[]; depth?: number }> = ({ data, columns, depth = 0 }) => (
      <>
        {data.map((row) => (
          <div key={`${depth}-${row.value}`}>
            <div>{columns[0].cell({ row: { original: row, depth }, getValue: () => row.value })}</div>
            {row.children && <Rows data={row.children} columns={columns} depth={depth + 1} />}
          </div>
        ))}
      </>
    );

    it('Should select unselected values', () => {
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
      render(<Rows data={result.current.tableData} columns={result.current.columns} />);

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

      expect(selectVariableValues).toHaveBeenCalledWith(['device1'], variable);
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
      render(<Rows data={result.current.tableData} columns={result.current.columns} />);

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
  });
});

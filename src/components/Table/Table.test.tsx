import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TestIds } from '../../constants';
import { Table } from './Table';

/**
 * Test Ids only for tests
 */
const InTestIds = {
  cell: (value: string, depth: number) => `cell-${depth}-${value},`,
};

describe('Table', () => {
  const getComponent = (props: any) => {
    return <Table {...props} />;
  };

  it('Should render all levels', () => {
    const data = [
      {
        value: '1',
        children: [
          {
            value: '1-1',
          },
          {
            value: '1-2',
          },
        ],
      },
      {
        value: '2',
        children: [
          {
            value: '2-1',
          },
          {
            value: '2-2',
          },
        ],
      },
    ];
    const columns: Array<ColumnDef<typeof data>> = [
      {
        id: 'value',
        accessorKey: 'value',
        cell: ({ getValue, row }) => (
          <div data-testid={InTestIds.cell(getValue() as string, row.depth)}>{getValue() as string}</div>
        ),
      },
    ];

    render(getComponent({ data, columns, getSubRows: (row: any) => row.children }));

    /**
     * Check first row with sub rows
     */
    expect(screen.getByTestId(InTestIds.cell('1', 0))).toBeInTheDocument();
    expect(screen.getByTestId(InTestIds.cell('1-1', 1))).toBeInTheDocument();
    expect(screen.getByTestId(InTestIds.cell('1-2', 1))).toBeInTheDocument();

    /**
     * Check second row with sub rows
     */
    expect(screen.getByTestId(InTestIds.cell('2', 0))).toBeInTheDocument();
    expect(screen.getByTestId(InTestIds.cell('2-1', 1))).toBeInTheDocument();
    expect(screen.getByTestId(InTestIds.cell('2-2', 1))).toBeInTheDocument();
  });

  it('Should render header', () => {
    render(getComponent({ showHeader: true, columns: [{ id: 'value', header: 'cell header' }], data: [] }));

    expect(screen.getByTestId(TestIds.table.header)).toBeInTheDocument();
  });

  it('Should not render header', () => {
    render(getComponent({ showHeader: false, columns: [{ id: 'value', header: 'cell header' }], data: [] }));

    expect(screen.queryByTestId(TestIds.table.header)).not.toBeInTheDocument();
  });

  it('Should show filter', async () => {
    render(
      getComponent({
        showHeader: true,
        columns: [
          {
            id: 'value',
            header: 'cell header',
            accessorKey: 'value',
            enableColumnFilter: true,
            cell: ({ getValue, row }: any) => {
              const value = getValue() as string;
              return <span data-testid={InTestIds.cell(value, row.depth)}>{value}</span>;
            },
          },
        ],
        data: [{ value: 'device1' }, { value: 'device2' }],
      })
    );

    /**
     * Check Filter presence
     */
    expect(screen.getByTestId(TestIds.table.buttonFilter)).toBeInTheDocument();
    expect(screen.queryByTestId(TestIds.table.fieldFilterValue)).not.toBeInTheDocument();

    /**
     * Open Filter
     */
    fireEvent.click(screen.getByTestId(TestIds.table.buttonFilter));

    /**
     * Check Filter Content Presence
     */
    expect(screen.getByTestId(TestIds.table.fieldFilterValue)).toBeInTheDocument();

    /**
     * Apply filter
     */
    await act(() =>
      fireEvent.change(screen.getByTestId(TestIds.table.fieldFilterValue), { target: { value: 'device1' } })
    );

    expect(screen.getByTestId(InTestIds.cell('device1', 0))).toBeInTheDocument();
    expect(screen.queryByTestId(InTestIds.cell('device2', 0))).not.toBeInTheDocument();
  });

  it('Should not show filter', () => {
    render(
      getComponent({
        showHeader: true,
        columns: [{ id: 'value', header: 'cell header', enableColumnFilter: false }],
        data: [],
      })
    );

    expect(screen.queryByTestId(TestIds.table.buttonFilter)).not.toBeInTheDocument();
  });
});

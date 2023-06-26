import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
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
});

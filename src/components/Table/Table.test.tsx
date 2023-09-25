import React, { useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TestIds } from '../../constants';
import { Table } from './Table';

/**
 * Test Ids only for tests
 */
const InTestIds = {
  cell: (value: string, depth: number) => `cell-${depth}-${value},`,
  favoriteCell: (value: string, depth: number) => `cell-favorite-${depth}-${value}`,
};

describe('Table', () => {
  /**
   * Wrapper with ref
   * @param props
   * @constructor
   */
  const Wrapper = (props: any) => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div ref={ref}>
        <Table scrollableContainerRef={ref} {...props} />
      </div>
    );
  };

  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: any) => <Wrapper {...props} />;

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

  it('Should show value filter', async () => {
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

  it('Should show value sorting', async () => {
    const { container } = render(
      getComponent({
        showHeader: true,
        columns: [
          {
            id: 'value',
            header: 'cell header',
            accessorKey: 'value',
            enableSorting: true,
            sortingFn: (rowA: any, rowB: any) => (rowA.original.status > rowB.original.status ? 1 : -1),
            cell: ({ getValue, row }: any) => {
              const value = getValue() as string;
              return <span data-testid={InTestIds.cell(value, row.depth)}>{value}</span>;
            },
          },
        ],
        data: [
          { value: 'device1', status: 60 },
          { value: 'device2', status: 50 },
        ],
      })
    );

    /**
     * Check Sort presence
     */
    expect(screen.getByTestId(TestIds.table.buttonSort)).toBeInTheDocument();

    /**
     * Apply asc sorting
     */
    await act(async () => fireEvent.click(screen.getByTestId(TestIds.table.buttonSort)));

    /**
     * Check Asc Sort order
     */
    const ascRows = container.querySelectorAll('tbody tr');
    expect(ascRows[0]).toHaveTextContent('device2');
    expect(ascRows[1]).toHaveTextContent('device1');

    /**
     * Apply desc sorting
     */
    await act(async () => fireEvent.click(screen.getByTestId(TestIds.table.buttonSort)));

    /**
     * Check Desc Sort order
     */
    const descRows = container.querySelectorAll('tbody tr');
    expect(descRows[0]).toHaveTextContent('device1');
    expect(descRows[1]).toHaveTextContent('device2');
  });

  it('Should show favorites filter', async () => {
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
          {
            id: 'isFavorite',
            header: '',
            accessorKey: 'isFavorite',
            enableColumnFilter: true,
            cell: ({ getValue, row }: any) => {
              const value = getValue() as boolean;
              return <span data-testid={InTestIds.favoriteCell(row.original.value, row.depth)}>{value}</span>;
            },
          },
        ],
        data: [
          { value: 'device1', isFavorite: true },
          { value: 'device2', isFavorite: false },
        ],
      })
    );

    /**
     * Check Filter presence
     */
    expect(screen.getByTestId(TestIds.table.favoritesFilter)).toBeInTheDocument();

    /**
     * Apply Favorite filter
     */
    await act(() => fireEvent.click(screen.getByTestId(TestIds.table.favoritesFilter)));

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

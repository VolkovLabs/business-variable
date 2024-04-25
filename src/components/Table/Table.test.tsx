import { ColumnDef } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { useRef } from 'react';

import { TEST_IDS } from '../../constants';
import { Table } from './Table';

/**
 * Props
 */
type Props = React.ComponentProps<typeof Table>;

/**
 * Mock the useVirtualizer hook partially
 * Return useVirtualizer with "options"
 * to reproduce the correct behavior in the tests
 */
jest.mock('@tanstack/react-virtual', () => ({
  ...jest.requireActual('@tanstack/react-virtual'),
  useVirtualizer: jest.fn((options) => ({
    ...jest.requireActual('@tanstack/react-virtual').useVirtualizer(options),
  })),
}));

/**
 * Test Ids only for tests
 */
const InTestIds = {
  cell: (value: string, depth: number) => `data-testid cell-${depth}-${value},`,
  favoriteCell: (value: string, depth: number) => `data-testid cell-favorite-${depth}-${value}`,
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
  const getComponent = (props: Partial<Props>) => <Wrapper {...props} />;

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.table,
    ...InTestIds,
  });
  const selectors = getSelectors(screen);

  it('Should render all levels', () => {
    const data: any = [
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

    render(getComponent({ data, columns: columns as any, getSubRows: (row: any) => row.children }));

    /**
     * Check first row with sub rows
     */
    expect(selectors.cell(false, '1', 0)).toBeInTheDocument();
    expect(selectors.cell(false, '1-1', 1)).toBeInTheDocument();
    expect(selectors.cell(false, '1-2', 1)).toBeInTheDocument();

    /**
     * Check second row with sub rows
     */
    expect(selectors.cell(false, '2', 0)).toBeInTheDocument();
    expect(selectors.cell(false, '2-1', 1)).toBeInTheDocument();
    expect(selectors.cell(false, '2-2', 1)).toBeInTheDocument();
  });

  it('Should render header', () => {
    render(getComponent({ showHeader: true, columns: [{ id: 'value', header: 'cell header' }], data: [] }));

    expect(selectors.header()).toBeInTheDocument();
  });

  it('Should not render header', () => {
    render(getComponent({ showHeader: false, columns: [{ id: 'value', header: 'cell header' }], data: [] }));

    expect(selectors.header(true)).not.toBeInTheDocument();
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
        data: [{ value: 'device1' }, { value: 'device2' }] as any,
      })
    );

    /**
     * Check Filter presence
     */
    expect(selectors.buttonFilter()).toBeInTheDocument();
    expect(selectors.fieldFilterValue(true)).not.toBeInTheDocument();

    /**
     * Open Filter
     */
    fireEvent.click(selectors.buttonFilter());

    /**
     * Check Filter Content Presence
     */
    expect(selectors.fieldFilterValue()).toBeInTheDocument();

    /**
     * Apply filter
     */
    await act(() => fireEvent.change(selectors.fieldFilterValue(), { target: { value: 'device1' } }));

    expect(selectors.cell(false, 'device1', 0)).toBeInTheDocument();
    expect(selectors.cell(true, 'device2', 0)).not.toBeInTheDocument();
  });

  it('Should clean value filter', async () => {
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
        data: [{ value: 'device1' }, { value: 'device2' }] as any,
      })
    );

    /**
     * Check Filter presence
     */
    expect(selectors.buttonFilter()).toBeInTheDocument();
    expect(selectors.fieldFilterValue(true)).not.toBeInTheDocument();

    /**
     * Open Filter
     */
    fireEvent.click(selectors.buttonFilter());

    /**
     * Check Filter Content Presence
     */
    expect(selectors.fieldFilterValue()).toBeInTheDocument();

    /**
     * Apply filter
     */
    await act(() => fireEvent.change(selectors.fieldFilterValue(), { target: { value: 'device1' } }));

    expect(selectors.buttonCleanFilterValue()).toBeInTheDocument();

    /**
     * Clean filter value
     */
    await act(async () => fireEvent.click(selectors.buttonCleanFilterValue()));

    expect(selectors.fieldFilterValue()).toHaveValue('');
  });

  it('Should always show value filter', async () => {
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
        data: [{ value: 'device1' }, { value: 'device2' }] as any,
        alwaysVisibleFilter: true,
      })
    );

    /**
     * Check Filter Content Presence
     */
    expect(selectors.fieldFilterValue()).toBeInTheDocument();
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
        ] as any,
      })
    );

    /**
     * Check Sort presence
     */
    expect(selectors.buttonSort()).toBeInTheDocument();

    /**
     * Apply asc sorting
     */
    await act(async () => fireEvent.click(selectors.buttonSort()));

    /**
     * Check Asc Sort order
     */
    const ascRows = container.querySelectorAll('tbody tr');
    expect(ascRows[0]).toHaveTextContent('device2');
    expect(ascRows[1]).toHaveTextContent('device1');

    /**
     * Apply desc sorting
     */
    await act(async () => fireEvent.click(selectors.buttonSort()));

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
        ] as any,
      })
    );

    /**
     * Check Filter presence
     */
    expect(selectors.favoritesFilter()).toBeInTheDocument();

    /**
     * Apply Favorite filter
     */
    await act(() => fireEvent.click(screen.getByTestId(TEST_IDS.table.favoritesFilter)));

    expect(selectors.cell(false, 'device1', 0)).toBeInTheDocument();
    expect(selectors.cell(true, 'device2', 0)).not.toBeInTheDocument();
  });

  it('Should not show filter', () => {
    render(
      getComponent({
        showHeader: true,
        columns: [{ id: 'value', header: 'cell header', enableColumnFilter: false }],
        data: [],
      })
    );

    expect(selectors.buttonFilter(true)).not.toBeInTheDocument();
  });

  it('Should scroll if autoScroll enabled', () => {
    const data = [
      {
        value: '1',
        children: [
          {
            value: '1-1',
            selected: false,
          },
          {
            value: '1-2',
            selected: false,
          },
        ],
      },
      {
        value: '2',
        children: [
          {
            value: '2-1',
            selected: true,
          },
          {
            value: '2-2',
            selected: false,
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

    const scrollToIndex = jest.fn();

    jest.mocked(useVirtualizer).mockImplementation(() => {
      return {
        scrollToIndex,
        getVirtualItems: jest.fn(() => []),
        getTotalSize: jest.fn(() => 2),
      } as any;
    });

    render(
      getComponent({
        data: data as any,
        columns: columns as any,
        autoScroll: true,
        isFocused: {
          current: false,
        },
        getSubRows: (row: any) => row.children,
      })
    );

    expect(scrollToIndex).toHaveBeenCalled();
    expect(scrollToIndex).toHaveBeenCalledWith(4, { align: 'start' });
  });

  it('Should not scroll if autoScroll disabled ', () => {
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

    const scrollToIndex = jest.fn();

    jest.mocked(useVirtualizer).mockImplementation(() => {
      return {
        scrollToIndex,
        getVirtualItems: jest.fn(() => []),
        getTotalSize: jest.fn(() => 2),
      } as any;
    });

    render(
      getComponent({
        data: data as any,
        columns: columns as any,
        autoScroll: false,
        isFocused: {
          current: false,
        },
        getSubRows: (row: any) => row.children,
      })
    );

    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('Should not Scroll if isFocused true ', () => {
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

    const scrollToIndex = jest.fn();

    jest.mocked(useVirtualizer).mockImplementation(() => {
      return {
        scrollToIndex,
        getVirtualItems: jest.fn(() => []),
        getTotalSize: jest.fn(() => 2),
      } as any;
    });

    render(
      getComponent({
        data: data as any,
        columns: columns as any,
        autoScroll: true,
        isFocused: {
          current: true,
        },
        getSubRows: (row: any) => row.children,
      })
    );

    expect(scrollToIndex).not.toHaveBeenCalled();
  });
});

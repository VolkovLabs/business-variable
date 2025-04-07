import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { useSavedState, useTable } from '../../hooks';
import { StatusStyleMode, VariableType } from '../../types';
import { Table } from '../Table';
import { TableView } from './TableView';

/**
 * Mock hooks
 */
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useTable: jest.fn(() => ({
    tableData: [],
    columns: [],
    getSubRows: jest.fn(),
  })),
  useLocalStorage: jest.fn(() => ({
    get: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  })),
  useSavedState: jest.fn(jest.requireActual('../../hooks/useSavedState').useSavedState),
}));

/**
 * In Test Ids
 */
const InTestIds = {
  outsideElement: 'data-testid outside-element',
  drawerMockTableView: 'data-testid drawer-mock-table-view',
};

/**
 * Mock table
 */
jest.mock('../Table', () => ({
  Table: jest.fn((...params) => jest.requireActual('../Table').Table(...params)),
}));

/**
 * Mock OptionsVariable
 */
jest.mock('../OptionsVariable', () => ({
  OptionsVariable: jest.fn(() => <div>Options Variable</div>),
}));

/**
 * Mock OptionsVariable
 */
jest.mock('./components', () => ({
  DrawerTable: jest.fn(() => <div data-testid={InTestIds.drawerMockTableView}>Drawer Table Mock</div>),
}));

/**
 * Properties
 */
type Props = React.ComponentProps<typeof TableView>;

/**
 * Table View
 */
describe('Table View', () => {
  const eventBus = {
    getStream: jest.fn(() => ({
      subscribe: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
    })),
  };

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.tableView, ...InTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = ({ options = {} as any, ...restProps }: Partial<Props>) => {
    return <TableView width={100} height={100} eventBus={eventBus} options={options} {...(restProps as any)} />;
  };

  beforeEach(() => {
    jest.mocked(useTable).mockClear();
  });

  it('Should find component', async () => {
    await act(async () => render(getComponent({})));
    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should show info message if no variables', async () => {
    await act(async () => render(getComponent({})));
    expect(selectors.infoMessage()).toBeInTheDocument();
  });

  it('Should use first group', async () => {
    await act(async () =>
      render(
        getComponent({
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'group1Field',
                  },
                ],
              },
              {
                name: 'group2',
                items: [],
              },
            ],
          } as any,
        })
      )
    );

    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: [
          {
            name: 'group1Field',
          },
        ],
      })
    );
  });

  it('Should open saved selected group', async () => {
    jest.mocked(useSavedState).mockReturnValueOnce(['group2', jest.fn()] as any);

    await act(async () =>
      render(
        getComponent({
          id: 15,
          options: {
            groups: [
              { name: 'group1', items: [{ name: '1' }] },
              { name: 'group2', items: [{ name: '2' }] },
              { name: 'group3', items: [{ name: '3' }] },
            ],
            saveSelectedGroup: true,
            saveSelectedGroupKey: 'myKey',
          } as any,
        })
      )
    );

    /**
     * Check if selected group key used
     */
    expect(useSavedState).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'volkovlabs.variable.panel.myKey',
        enabled: true,
      })
    );

    /**
     * Check if levels from current group used
     */
    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: [
          {
            name: '2',
          },
        ],
      })
    );
  });

  it('Should use first group if already selected group removed', async () => {
    const { rerender } = await act(async () =>
      render(
        getComponent({
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'group1Field',
                  },
                ],
              },
              {
                name: 'group2',
                items: [],
              },
            ],
          } as any,
        })
      )
    );

    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: [
          {
            name: 'group1Field',
          },
        ],
      })
    );

    await act(async () =>
      rerender(
        getComponent({
          options: {
            groups: [
              {
                name: 'group2',
                items: [
                  {
                    name: 'group2Field',
                  },
                ],
              },
            ],
          } as any,
        })
      )
    );

    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: [
          {
            name: 'group2Field',
          },
        ],
      })
    );
  });

  it('Should switch groups and scroll to selected', async () => {
    jest.mocked(useTable).mockImplementation(() => ({
      tableData: [
        { value: 'device1', selected: false, showStatus: false, label: 'Device 1', statusMode: StatusStyleMode.COLOR },
      ],
      columns: [{ id: 'value', accessorKey: 'value' }],
      getSubRows: () => undefined,
      runtimeVariable: {} as any,
    }));

    /**
     * Mock table
     */
    let onAfterScroll: any;
    jest.mocked(Table).mockImplementationOnce((props) => {
      onAfterScroll = props.onAfterScroll;

      return jest.requireActual('../Table').Table(props);
    });

    const { rerender } = await act(async () =>
      render(
        getComponent({
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'group1Field',
                  },
                ],
              },
              {
                name: 'group2',
                items: [
                  {
                    name: 'group2Field',
                  },
                ],
              },
            ],
          } as any,
        })
      )
    );

    /**
     * Select group2
     */
    fireEvent.click(selectors.tab(false, 'group2'));

    /**
     * Check if group selected
     */
    expect(useTable).toHaveBeenCalledWith(
      expect.objectContaining({
        levels: [
          {
            name: 'group2Field',
          },
        ],
      })
    );

    /**
     * Check if scroll enabled
     */
    expect(Table).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldScroll: {
          current: true,
        },
      }),
      expect.anything()
    );

    /**
     * Simulate table scroll
     */
    onAfterScroll();

    /**
     * Re-render to check if scroll disabled
     */
    await act(async () =>
      rerender(
        getComponent({
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'group1Field',
                  },
                ],
              },
              {
                name: 'group2',
                items: [
                  {
                    name: 'group2Field',
                  },
                ],
              },
            ],
          } as any,
        })
      )
    );

    /**
     * Check if scroll disabled
     */
    expect(Table).toHaveBeenCalledWith(
      expect.objectContaining({
        shouldScroll: {
          current: false,
        },
      }),
      expect.anything()
    );
  });

  it('Should open and close drawer for QUERY variable', async () => {
    jest.mocked(useTable).mockImplementation(() => ({
      tableData: [
        { value: 'device1', selected: false, showStatus: false, label: 'Device 1', statusMode: StatusStyleMode.COLOR },
      ],
      columns: [{ id: 'value', accessorKey: 'value' }],
      getSubRows: () => undefined,
      runtimeVariable: { type: VariableType.QUERY } as any,
    }));

    await act(async () =>
      render(
        getComponent({
          id: 15,
          options: {
            isMinimizeForTable: true,
            groups: [
              { name: 'group1', items: [{ name: '1' }] },
              { name: 'group2', items: [{ name: '2' }] },
              { name: 'group3', items: [{ name: '3' }] },
            ],
            saveSelectedGroup: true,
            saveSelectedGroupKey: 'myKey',
          } as any,
        })
      )
    );

    expect(selectors.buttonOpenDrawer()).toBeInTheDocument();
    expect(selectors.drawerMockTableView(true)).not.toBeInTheDocument();
    expect(selectors.buttonCloseDrawer(true)).not.toBeInTheDocument();

    fireEvent.click(selectors.buttonOpenDrawer());

    expect(selectors.drawerMockTableView()).toBeInTheDocument();
    expect(selectors.buttonCloseDrawer()).toBeInTheDocument();

    fireEvent.click(selectors.buttonCloseDrawer());
    expect(selectors.buttonCloseDrawer(true)).not.toBeInTheDocument();
  });

  it('Should open and close drawer for CUSTOM variable', async () => {
    jest.mocked(useTable).mockImplementation(() => ({
      tableData: [
        { value: 'device1', selected: false, showStatus: false, label: 'Device 1', statusMode: StatusStyleMode.COLOR },
      ],
      columns: [{ id: 'value', accessorKey: 'value' }],
      getSubRows: () => undefined,
      runtimeVariable: { type: VariableType.CUSTOM } as any,
    }));

    await act(async () =>
      render(
        getComponent({
          id: 15,
          options: {
            isMinimizeForTable: true,
            groups: [
              { name: 'group1', items: [{ name: '1' }] },
              { name: 'group2', items: [{ name: '2' }] },
              { name: 'group3', items: [{ name: '3' }] },
            ],
            saveSelectedGroup: true,
            saveSelectedGroupKey: 'myKey',
          } as any,
        })
      )
    );

    expect(selectors.buttonOpenDrawer()).toBeInTheDocument();
    expect(selectors.drawerMockTableView(true)).not.toBeInTheDocument();
    expect(selectors.buttonCloseDrawer(true)).not.toBeInTheDocument();

    fireEvent.click(selectors.buttonOpenDrawer());

    expect(selectors.drawerMockTableView()).toBeInTheDocument();
    expect(selectors.buttonCloseDrawer()).toBeInTheDocument();

    fireEvent.click(selectors.buttonCloseDrawer());
    expect(selectors.buttonCloseDrawer(true)).not.toBeInTheDocument();
  });

  it('Should not display minimize if variable not valid type', async () => {
    jest.mocked(useTable).mockImplementation(() => ({
      tableData: [
        { value: 'device1', selected: false, showStatus: false, label: 'Device 1', statusMode: StatusStyleMode.COLOR },
      ],
      columns: [{ id: 'value', accessorKey: 'value' }],
      getSubRows: () => undefined,
      runtimeVariable: { type: VariableType.TEXTBOX } as any,
    }));

    await act(async () =>
      render(
        getComponent({
          id: 15,
          options: {
            isMinimizeForTable: true,
            groups: [
              { name: 'group1', items: [{ name: '1' }] },
              { name: 'group2', items: [{ name: '2' }] },
              { name: 'group3', items: [{ name: '3' }] },
            ],
            saveSelectedGroup: true,
            saveSelectedGroupKey: 'myKey',
          } as any,
        })
      )
    );

    expect(selectors.buttonOpenDrawer(true)).not.toBeInTheDocument();
    expect(selectors.drawerMockTableView(true)).not.toBeInTheDocument();
  });
});

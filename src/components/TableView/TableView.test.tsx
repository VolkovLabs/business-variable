import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { useDockMenuPosition, useSavedState, useTable } from '../../hooks';
import { StatusStyleMode, TableViewPosition, VariableType } from '../../types';
import { TableView } from './TableView';
import { TableMinimizeView, TableToolbar } from './components';
import { Table } from '../Table';

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
  useDockMenuPosition: jest.fn(() => ({
    dockedMenuSize: { width: 300, height: 400 },
    dockMenuToggle: jest.fn(),
    isDockMenuDisplay: true,
    dockMenuPosition: { current: null },
    buttonTogglePosition: { current: null },
    forceRerender: 0,
  })),
}));

/**
 * In Test Ids
 */
const InTestIds = {
  drawerMockTableView: 'data-testid drawer-mock-table-view',
  tableErrorMessage: 'data-testid table-error-message-mock',
  tableToolbar: 'data-testid table-toolbar-mock',
  tableToggleDockMenuButtons: 'data-testid table-toggle-dock-menu-buttons-mock',
  tableMinimizeView: 'data-testid table-minimize-view-mock',
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
 * Mock DrawerTable
 */
jest.mock('./components/TableErrorMessage', () => ({
  DrawerTable: jest.fn(() => <div data-testid={InTestIds.drawerMockTableView}>Drawer Table Mock</div>),
}));

/**
 * Mock TableErrorMessage
 */
jest.mock('./components/TableErrorMessage', () => ({
  TableErrorMessage: jest.fn(() => <div data-testid={InTestIds.tableErrorMessage}>Error Message</div>),
}));

/**
 * Mock TableToolbar
 */
jest.mock('./components/TableToolbar', () => ({
  TableToolbar: jest.fn(() => <div data-testid={InTestIds.tableToolbar}>Table Toolbar Mock</div>),
}));

/**
 * Mock ToggleDockMenuButtons
 */
jest.mock('./components/ToggleDockMenuButtons', () => ({
  ToggleDockMenuButtons: jest.fn(() => (
    <div data-testid={InTestIds.tableToggleDockMenuButtons}>Table Toggle Buttons Mock</div>
  )),
}));

/**
 * Mock TableMinimizeView
 */
jest.mock('./components/TableMinimizeView', () => ({
  TableMinimizeView: jest.fn(() => <div data-testid={InTestIds.tableMinimizeView}>Table minimize view</div>),
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
    await act(async () =>
      render(
        getComponent({
          options: {
            tableViewPosition: TableViewPosition.NORMAL,
          } as any,
        })
      )
    );
    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should show info message if no variables', async () => {
    await act(async () =>
      render(
        getComponent({
          options: {
            tableViewPosition: TableViewPosition.NORMAL,
          } as any,
        })
      )
    );
    expect(selectors.tableErrorMessage()).toBeInTheDocument();
  });

  it('Should open and close drawer for variable', async () => {
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
            tableViewPosition: TableViewPosition.MINIMIZE,
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

    expect(TableMinimizeView).toHaveBeenCalled();
    const props = jest.mocked(TableMinimizeView).mock.calls[0][0];
    expect(typeof props.setIsDrawerOpen).toEqual('function');

    expect(selectors.drawerMockTableView(true)).not.toBeInTheDocument();
    expect(selectors.buttonCloseDrawer(true)).not.toBeInTheDocument();

    act(() => {
      props.setIsDrawerOpen(true);
    });

    expect(selectors.buttonCloseDrawer()).toBeInTheDocument();

    act(() => {
      fireEvent.click(selectors.buttonCloseDrawer());
    });

    expect(selectors.buttonCloseDrawer(true)).not.toBeInTheDocument();
  });

  it('Should call on AfterScroll', async () => {
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
            tableViewPosition: TableViewPosition.NORMAL,
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

    expect(TableToolbar).toHaveBeenCalled();
    const propsToolbar = jest.mocked(TableToolbar).mock.calls[0][0];

    expect(propsToolbar.shouldScroll.current).toBeFalsy();

    const tableProps = jest.mocked(Table).mock.calls[0][0];

    act(() => {
      tableProps.onAfterScroll();
    });
  });

  it('Should display as minimize view', async () => {
    await act(async () =>
      render(
        getComponent({
          options: {
            tableViewPosition: TableViewPosition.MINIMIZE,
          } as any,
        })
      )
    );
    expect(selectors.tableMinimizeView()).toBeInTheDocument();
  });

  it('Should display as components in docked view', async () => {
    await act(async () =>
      render(
        getComponent({
          options: {
            tableViewPosition: TableViewPosition.DOCKED,
          } as any,
        })
      )
    );

    expect(selectors.tableMinimizeView(true)).not.toBeInTheDocument();
    expect(selectors.dockedIcon()).toBeInTheDocument();
  });

  it('Should not render portal content when dockMenuPosition.current is null in DOCKED view', async () => {
    /**
     * Mock useDockMenuPosition to return null refs
     */
    jest.mocked(useDockMenuPosition).mockReturnValue({
      dockedMenuSize: { width: 300, height: 400 },
      dockMenuToggle: jest.fn(),
      isDockMenuDisplay: true,
      dockMenuPosition: { current: null },
      buttonTogglePosition: { current: null },
      forceRerender: 0,
    });

    await act(async () =>
      render(
        getComponent({
          options: {
            tableViewPosition: TableViewPosition.DOCKED,
            groups: [{ name: 'group1', items: [] }],
          } as any,
        })
      )
    );

    /**
     * Check that only docked icon is rendered, no portal content
     */
    expect(selectors.dockedIcon()).toBeInTheDocument();
    expect(selectors.root(true)).not.toBeInTheDocument();
  });

  it('Should render only main table portal when dockMenuPosition exists but buttonTogglePosition is null', async () => {
    jest.mocked(useTable).mockImplementation(() => ({
      tableData: [
        { value: 'test', selected: false, showStatus: false, label: 'Test', statusMode: StatusStyleMode.COLOR },
      ],
      columns: [],
      getSubRows: jest.fn(),
      runtimeVariable: { name: 'Variable' } as any,
    }));
    /**
     * Create mock DOM element only for main table
     */
    const mockDockMenuElement = document.createElement('div');
    document.body.appendChild(mockDockMenuElement);

    /**
     * Mock useDockMenuPosition with only dockMenuPosition
     */
    jest.mocked(useDockMenuPosition).mockReturnValue({
      dockedMenuSize: { width: 300, height: 400 },
      dockMenuToggle: jest.fn(),
      isDockMenuDisplay: true,
      dockMenuPosition: { current: mockDockMenuElement },
      buttonTogglePosition: { current: null },
      forceRerender: 0,
    });

    await act(async () =>
      render(
        getComponent({
          options: {
            tableViewPosition: TableViewPosition.DOCKED,
            groups: [
              { name: 'group1', items: [] },
              { name: 'group2', items: [] },
            ],
          } as any,
        })
      )
    );

    /**
     * Check that only main table portal is rendered
     */
    expect(mockDockMenuElement).toContainHTML('data-testid="data-testid table header"');
    expect(selectors.dockedIcon()).toBeInTheDocument();

    /**
     * Check that toggle buttons are not rendered in any portal
     */
    expect(document.body).not.toContainHTML('data-testid="table-toggle-dock-menu-buttons-mock"');

    /**
     * Clean up
     */
    document.body.removeChild(mockDockMenuElement);
  });

  it('Should render portal content when dockMenuPosition.current exists in DOCKED view', async () => {
    jest.mocked(useTable).mockImplementation(() => ({
      tableData: [
        { value: 'test', selected: false, showStatus: false, label: 'Test', statusMode: StatusStyleMode.COLOR },
      ],
      columns: [],
      getSubRows: jest.fn(),
      runtimeVariable: { name: 'Variable' } as any,
    }));

    /**
     * Create mock DOM elements for portals
     */
    const mockDockMenuElement = document.createElement('div');
    const mockButtonToggleElement = document.createElement('div');

    document.body.appendChild(mockDockMenuElement);
    document.body.appendChild(mockButtonToggleElement);

    /**
     * Mock useDockMenuPosition to return elements
     */
    jest.mocked(useDockMenuPosition).mockReturnValue({
      dockedMenuSize: { width: 300, height: 400 },
      dockMenuToggle: jest.fn(),
      isDockMenuDisplay: true,
      dockMenuPosition: { current: mockDockMenuElement },
      buttonTogglePosition: { current: mockButtonToggleElement },
      forceRerender: 0,
    });

    await act(async () =>
      render(
        getComponent({
          options: {
            tableViewPosition: TableViewPosition.DOCKED,
            groups: [
              { name: 'group1', items: [] },
              { name: 'group2', items: [] },
            ],
          } as any,
        })
      )
    );

    /**
     * Check that portal content is rendered
     */
    expect(mockDockMenuElement).toContainHTML('data-testid="data-testid table header"');
    expect(selectors.dockedIcon()).toBeInTheDocument();

    /**
     * Clean up
     */
    document.body.removeChild(mockDockMenuElement);
    document.body.removeChild(mockButtonToggleElement);
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

  describe('Pinned groups functionality', () => {
    /**
     * Mock useSavedState for pinned groups
     */
    const mockSetPinnedGroups = jest.fn();

    beforeEach(() => {
      jest.mocked(useSavedState).mockImplementation((config: any) => {
        if (config.key.includes('pinned')) {
          return [[], mockSetPinnedGroups, true] as any;
        }
        return [config.initialValue, jest.fn(), true] as any;
      });
    });

    afterEach(() => {
      mockSetPinnedGroups.mockClear();
    });

    describe('Clean up pinned groups', () => {
      it('Should remove non-existent groups from pinned list', async () => {
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [['group1', 'group2', 'group3'], mockSetPinnedGroups, true] as any;
          }
          return [config.initialValue, jest.fn(), true] as any;
        });

        const { rerender } = await act(async () =>
          render(
            getComponent({
              options: {
                isPinTabsEnabled: true,
                groups: [
                  { name: 'group1', items: [] },
                  { name: 'group2', items: [] },
                  { name: 'group3', items: [] },
                ],
              } as any,
            })
          )
        );

        await act(async () =>
          rerender(
            getComponent({
              options: {
                isPinTabsEnabled: true,
                groups: [
                  { name: 'group1', items: [] },
                  { name: 'group3', items: [] },
                ],
              } as any,
            })
          )
        );

        expect(mockSetPinnedGroups).toHaveBeenCalledWith(['group1', 'group3']);
      });

      it('Should not update if all pinned groups are valid', async () => {
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [['group1', 'group2'], mockSetPinnedGroups, true] as any;
          }
          return [config.initialValue, jest.fn(), true] as any;
        });

        await act(async () =>
          render(
            getComponent({
              options: {
                isPinTabsEnabled: true,
                groups: [
                  { name: 'group1', items: [] },
                  { name: 'group2', items: [] },
                  { name: 'group3', items: [] },
                ],
              } as any,
            })
          )
        );

        expect(mockSetPinnedGroups).not.toHaveBeenCalled();
      });

      it('Should convert object to array when cleaning up', async () => {
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [{ 0: 'group1', 1: 'deletedGroup' }, mockSetPinnedGroups, true] as any;
          }
          return [config.initialValue, jest.fn(), true] as any;
        });

        await act(async () =>
          render(
            getComponent({
              options: {
                isPinTabsEnabled: true,
                groups: [
                  { name: 'group1', items: [] },
                  { name: 'group2', items: [] },
                ],
              } as any,
            })
          )
        );

        expect(mockSetPinnedGroups).toHaveBeenCalledWith(['group1']);
      });
    });
  });

  describe('Focus handling', () => {
    it('Should set focus on mouse down and remove on click outside', async () => {
      jest.mocked(useTable).mockImplementation(() => ({
        tableData: [
          { value: 'test', selected: false, showStatus: false, label: 'Test', statusMode: StatusStyleMode.COLOR },
        ],
        columns: [],
        getSubRows: jest.fn(),
        runtimeVariable: { name: 'Variable' } as any,
      }));

      await act(async () =>
        render(
          <>
            {getComponent({
              options: {
                tableViewPosition: TableViewPosition.NORMAL,
                groups: [
                  { name: 'group1', items: [] },
                  { name: 'group2', items: [] },
                ],
              } as any,
            })}
            <div data-testid={TEST_IDS.tableView.outsideElement}>Outside</div>
          </>
        )
      );

      const rootElement = selectors.root();

      fireEvent.mouseDown(rootElement);

      const outsideElement = selectors.outsideElement();
      fireEvent.click(outsideElement, { bubbles: true });

      expect(rootElement).toBeInTheDocument();
    });
  });
});

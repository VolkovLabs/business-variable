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
 * Mock DrawerTable
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
      runtimeVariable: { name: 'Variable' } as any,
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

  it('Should display custom error message if no data', async () => {
    const replaceVariables = jest.fn((string: string) => string);

    jest.mocked(useTable).mockImplementation(() => ({
      tableData: [],
      columns: [{ id: 'value', accessorKey: 'value' }],
      getSubRows: () => undefined,
      runtimeVariable: { name: 'Variable' } as any,
    }));

    /**
     * Mock table
     */

    jest.mocked(Table).mockImplementationOnce((props) => {
      return jest.requireActual('../Table').Table(props);
    });

    await act(async () =>
      render(
        getComponent({
          replaceVariables,
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'group1Field',
                  },
                ],
                noDataCustomMessage: 'Custom message no data',
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

    expect(selectors.noDataMessage()).toBeInTheDocument();
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

  it('Should open and close drawer with custom icon for query variable', async () => {
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
            isColumnManagerShowCustomIcon: true,
            columnManagerCustomIcon: 'https://example.com/custom-icon.png',
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

    expect(selectors.buttonOpenDrawerCustomIcon()).toBeInTheDocument();
    expect(selectors.drawerMockTableView(true)).not.toBeInTheDocument();
    expect(selectors.buttonCloseDrawer(true)).not.toBeInTheDocument();

    fireEvent.click(selectors.buttonOpenDrawerCustomIcon());

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

  it('Should not display custom icon button when isColumnManagerShowCustomIcon is true but columnManagerCustomIcon is empty', async () => {
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
            isColumnManagerShowCustomIcon: true,
            columnManagerCustomIcon: '',
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

    expect(selectors.buttonOpenDrawerCustomIcon(true)).not.toBeInTheDocument();
    expect(selectors.buttonOpenDrawer(true)).not.toBeInTheDocument();
    expect(selectors.drawerMockTableView(true)).not.toBeInTheDocument();
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

    describe('Safe pinned groups', () => {
      it('Should return array if pinnedGroups is already an array', async () => {
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
                ],
              } as any,
            })
          )
        );

        expect(selectors.tab(false, 'group1')).toBeInTheDocument();
      });

      it('Should convert object to array if pinnedGroups is an object', async () => {
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [{ 0: 'group1', 1: 'group2', other: 123 }, mockSetPinnedGroups, true] as any;
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

        expect(selectors.tab(false, 'group1')).toBeInTheDocument();
      });

      it('Should return empty array if pinnedGroups is null or undefined', async () => {
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [null, mockSetPinnedGroups, true] as any;
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

        expect(selectors.tab(false, 'group1')).toBeInTheDocument();
      });
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

    describe('Toggle pin group', () => {
      it('Should pin a group when clicking pin button', async () => {
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

        const pinButton = selectors.pinButton(false, 'group1');
        fireEvent.click(pinButton);

        expect(mockSetPinnedGroups).toHaveBeenCalled();
        const updateFunction = mockSetPinnedGroups.mock.calls[0][0];
        expect(updateFunction([])).toEqual(['group1']);
      });

      it('Should unpin a group when clicking pin button on pinned group', async () => {
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [['group1'], mockSetPinnedGroups, true] as any;
          }
          return [config.initialValue, jest.fn(), true] as any;
        });

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

        const pinButton = selectors.pinButton(false, 'group1');
        fireEvent.click(pinButton);

        expect(mockSetPinnedGroups).toHaveBeenCalled();
        const updateFunction = mockSetPinnedGroups.mock.calls[0][0];
        expect(updateFunction(['group1'])).toEqual([]);
      });

      it('Should handle object state when toggling pin', async () => {
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

        const pinButton = selectors.pinButton(false, 'group1');
        fireEvent.click(pinButton);

        const updateFunction = mockSetPinnedGroups.mock.calls[0][0];
        expect(updateFunction({ 0: 'group2', other: 123 })).toEqual(['group2', 'group1']);
      });

      it('Should stop propagation when clicking pin button', async () => {
        const mockSetCurrentGroup = jest.fn();
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [[], mockSetPinnedGroups, true] as any;
          }
          return ['group1', mockSetCurrentGroup, true] as any;
        });

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

        const pinButton = selectors.pinButton(false, 'group1');
        fireEvent.click(pinButton);

        expect(mockSetCurrentGroup).not.toHaveBeenCalled();
      });

      it('Should handle primitive values (string, number, boolean) when toggling pin', async () => {
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

        const pinButton = selectors.pinButton(false, 'group1');
        fireEvent.click(pinButton);

        const updateFunction = mockSetPinnedGroups.mock.calls[0][0];

        expect(updateFunction('some-string')).toEqual(['group1']);
        expect(updateFunction(123)).toEqual(['group1']);
        expect(updateFunction(true)).toEqual(['group1']);
        expect(updateFunction(undefined)).toEqual(['group1']);
        expect(updateFunction(null)).toEqual(['group1']);
      });

      describe('TabsInOrder functionality', () => {
        const mockSetPinnedGroups = jest.fn();

        beforeEach(() => {
          jest.mocked(useSavedState).mockImplementation((config: any) => {
            if (config.key.includes('pinned')) {
              return [['group2'], mockSetPinnedGroups, true] as any;
            }
            return ['group1', jest.fn(), true] as any;
          });

          jest.mocked(useTable).mockImplementation(() => ({
            tableData: [
              { value: 'test', selected: false, showStatus: false, label: 'Test', statusMode: StatusStyleMode.COLOR },
            ],
            columns: [],
            getSubRows: jest.fn(),
            runtimeVariable: { name: 'Variable' } as any,
          }));
        });

        afterEach(() => {
          mockSetPinnedGroups.mockClear();
        });

        it('Should use new logic when tabsInOrder is true', async () => {
          await act(async () =>
            render(
              getComponent({
                options: {
                  isPinTabsEnabled: true,
                  tabsInOrder: true,
                  groups: [
                    { name: 'group1', items: [] },
                    { name: 'group2', items: [] },
                    { name: 'group3', items: [] },
                    { name: 'group4', items: [] },
                  ],
                } as any,
              })
            )
          );

          const tabs = [
            selectors.tab(false, 'group2'),
            selectors.tab(false, 'group1'),
            selectors.tab(false, 'group3'),
            selectors.tab(false, 'group4'),
          ];
          expect(tabs[0]).toHaveTextContent('group2');
          expect(tabs[1]).toHaveTextContent('group1');
          expect(tabs[2]).toHaveTextContent('group3');
          expect(tabs[3]).toHaveTextContent('group4');
        });
      });
    });

    describe('Sorted groups', () => {
      it('Should show pinned groups first', async () => {
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [['group2', 'group3'], mockSetPinnedGroups, true] as any;
          }
          return [config.initialValue, jest.fn(), true] as any;
        });

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
            getComponent({
              options: {
                isPinTabsEnabled: true,
                groups: [
                  { name: 'group1', items: [] },
                  { name: 'group2', items: [] },
                  { name: 'group3', items: [] },
                  { name: 'group4', items: [] },
                ],
              } as any,
            })
          )
        );

        const tabs = [
          selectors.tab(false, 'group2'),
          selectors.tab(false, 'group3'),
          selectors.tab(false, 'group1'),
          selectors.tab(false, 'group4'),
        ];
        expect(tabs[0]).toHaveTextContent('group2');
        expect(tabs[1]).toHaveTextContent('group3');
        expect(tabs[2]).toHaveTextContent('group1');
        expect(tabs[3]).toHaveTextContent('group4');
      });

      it('Should maintain pin order', async () => {
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [['group3', 'group1'], mockSetPinnedGroups, true] as any;
          }
          return [config.initialValue, jest.fn(), true] as any;
        });

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

        const tabs = [selectors.tab(false, 'group3'), selectors.tab(false, 'group1'), selectors.tab(false, 'group2')];
        expect(tabs[0]).toHaveTextContent('group3');
        expect(tabs[1]).toHaveTextContent('group1');
        expect(tabs[2]).toHaveTextContent('group2');
      });

      it('Should show all groups when pinned not loaded yet', async () => {
        jest.mocked(useSavedState).mockImplementation((config: any) => {
          if (config.key.includes('pinned')) {
            return [['group2'], mockSetPinnedGroups, false] as any;
          }
          return [config.initialValue, jest.fn(), true] as any;
        });

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

        const tabs = [selectors.tab(false, 'group1'), selectors.tab(false, 'group2')];
        expect(tabs[0]).toHaveTextContent('group1');
        expect(tabs[1]).toHaveTextContent('group2');
      });
    });
  });

  describe('Pin tabs disabled (isPinTabsEnabled = false)', () => {
    it('Should render tabs in original order regardless of pinnedGroups', async () => {
      jest.mocked(useSavedState).mockImplementation((config: any) => {
        if (config.key.includes('pinned')) {
          return [['group2', 'group1'], jest.fn(), true] as any;
        }
        return [config.initialValue, jest.fn(), true] as any;
      });
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
          getComponent({
            options: {
              isPinTabsEnabled: false,
              groups: [
                { name: 'group1', items: [] },
                { name: 'group2', items: [] },
                { name: 'group3', items: [] },
              ],
            } as any,
          })
        )
      );

      const tabs = [selectors.tab(false, 'group1'), selectors.tab(false, 'group2'), selectors.tab(false, 'group3')];
      expect(tabs[0]).toHaveTextContent('group1');
      expect(tabs[1]).toHaveTextContent('group2');
      expect(tabs[2]).toHaveTextContent('group3');
    });

    it('Should not call setPinnedGroups when pin tabs is disabled', async () => {
      const mockSetPinnedGroups = jest.fn();
      jest.mocked(useSavedState).mockImplementation((config: any) => {
        if (config.key.includes('pinned')) {
          return [['group2', 'group1'], mockSetPinnedGroups, true] as any;
        }
        return [config.initialValue, jest.fn(), true] as any;
      });
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
          getComponent({
            options: {
              isPinTabsEnabled: false,
              groups: [
                { name: 'group1', items: [] },
                { name: 'group2', items: [] },
              ],
            } as any,
          })
        )
      );

      expect(mockSetPinnedGroups).not.toHaveBeenCalled();
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

    it('Should not affect component when clicking outside without prior focus', async () => {
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
                groups: [{ name: 'group1', items: [] }],
              } as any,
            })}
            <div data-testid={TEST_IDS.tableView.outsideElement}>Outside</div>
          </>
        )
      );

      const outsideElement = selectors.outsideElement();
      fireEvent.click(outsideElement, { bubbles: true });

      expect(selectors.root()).toBeInTheDocument();
    });

    it('Should maintain focus when clicking inside the component', async () => {
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

      const tab = selectors.tab(false, 'group1');
      fireEvent.click(tab);

      expect(rootElement).toBeInTheDocument();
      expect(tab).toBeInTheDocument();
    });

    it('Should handle multiple focus/unfocus cycles', async () => {
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
                groups: [{ name: 'group1', items: [] }],
              } as any,
            })}
            <div data-testid={TEST_IDS.tableView.outsideElement}>Outside</div>
          </>
        )
      );

      const rootElement = selectors.root();
      const outsideElement = selectors.outsideElement();

      fireEvent.mouseDown(rootElement);
      fireEvent.click(outsideElement, { bubbles: true });

      fireEvent.mouseDown(rootElement);
      fireEvent.click(outsideElement, { bubbles: true });

      expect(rootElement).toBeInTheDocument();
    });
  });
});

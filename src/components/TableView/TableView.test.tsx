import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { useSavedState, useTable } from '../../hooks';
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
 * Properties
 */
type Props = React.ComponentProps<typeof TableView>;

/**
 * In Test Ids
 */
const InTestIds = {
  outsideElement: 'data-testid outside-element',
};

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

  it('Should switch groups', async () => {
    jest.mocked(useTable).mockImplementation(() => ({
      tableData: [{ value: 'device1', selected: false, showStatus: false, label: 'Device 1' }],
      columns: [{ id: 'value', accessorKey: 'value' }],
      getSubRows: () => undefined,
      variableValue: '',
    }));

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
  });
});

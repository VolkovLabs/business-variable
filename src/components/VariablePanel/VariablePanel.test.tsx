import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestIds } from '../../constants';
import { useTable } from './hooks';
import { VariablePanel } from './VariablePanel';

/**
 * Mock hooks
 */
jest.mock('./hooks', () => ({
  ...jest.requireActual('./hooks'),
  useTable: jest.fn(() => ({
    tableData: [],
    columns: [],
    getSubRows: () => undefined,
  })),
}));

/**
 * Panel
 */
describe('Panel', () => {
  const eventBus = {
    getStream: jest.fn(() => ({
      subscribe: jest.fn(() => ({
        unsubscribe: jest.fn(),
      })),
    })),
  };

  /**
   * Get Tested Component
   */
  const getComponent = ({ options = { name: 'data' }, ...restProps }: any) => {
    return <VariablePanel width={100} height={100} eventBus={eventBus} {...restProps} options={options} />;
  };

  it('Should find component', async () => {
    render(getComponent({}));
    expect(screen.getByTestId(TestIds.panel.root)).toBeInTheDocument();
  });

  it('Should show info message if no variables', async () => {
    render(getComponent({}));
    expect(screen.getByTestId(TestIds.panel.infoMessage)).toBeInTheDocument();
  });

  it('Should use first group', () => {
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
        },
      })
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

  it('Should use first group if already selected group removed', () => {
    const { rerender } = render(
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
        },
      })
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
        },
      })
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

  it('Should switch groups', () => {
    jest.mocked(useTable).mockImplementation(() => ({
      tableData: [{ value: 'device1', selected: false, showStatus: false }],
      columns: [{ id: 'value', accessorKey: 'value' }],
      getSubRows: () => undefined,
    }));

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
        },
      })
    );

    /**
     * Select group2
     */
    fireEvent.click(screen.getByTestId(TestIds.panel.tab('group2')));

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

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestIds } from '../../constants';
import { useTable } from '../../hooks';
import { TableView } from './TableView';

/**
 * Mock hooks
 */
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useTable: jest.fn(() => ({
    tableData: [],
    columns: [],
    getSubRows: () => undefined,
  })),
}));

/**
 * Properties
 */
type Props = React.ComponentProps<typeof TableView>;

/**
 * In Test Ids
 */
const InTestIds = {
  outsideElement: 'outside-element',
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
   * Get Tested Component
   */
  const getComponent = ({ options = {} as any, ...restProps }: Partial<Props>) => {
    return <TableView width={100} height={100} eventBus={eventBus} options={options} {...(restProps as any)} />;
  };

  it('Should find component', async () => {
    render(getComponent({}));
    expect(screen.getByTestId(TestIds.tableView.root)).toBeInTheDocument();
  });

  it('Should show info message if no variables', async () => {
    render(getComponent({}));
    expect(screen.getByTestId(TestIds.tableView.infoMessage)).toBeInTheDocument();
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
        } as any,
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
        } as any,
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
        } as any,
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
      tableData: [{ value: 'device1', selected: false, showStatus: false, label: 'Device 1' }],
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
        } as any,
      })
    );

    /**
     * Select group2
     */
    fireEvent.click(screen.getByTestId(TestIds.tableView.tab('group2')));

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

  describe('Auto Scroll', () => {
    const scrollTo = jest.fn();

    const OutsideWrapper = ({ children }: any) => (
      <div>
        <div data-testid={InTestIds.outsideElement} />
        {children}
      </div>
    );

    beforeAll(() => {
      Object.defineProperty(Element.prototype, 'scrollTo', { value: scrollTo });

      const getBoundingClientRect = function (this: HTMLElement) {
        return {
          top: this.tagName === 'TR' ? 40 : 0,
        };
      };
      Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
        value: getBoundingClientRect,
      });

      jest.mocked(useTable).mockImplementation(() => ({
        tableData: [
          { value: 'device1', selected: false, showStatus: false, label: 'Device 1' },
          { value: 'device2', selected: true, showStatus: false, label: 'Device 2' },
        ],
        columns: [{ id: 'value', accessorKey: 'value' }],
        getSubRows: () => undefined,
      }));
    });

    beforeEach(() => {
      scrollTo.mockClear();
    });

    it('Should scroll to selected element on initial load', () => {
      render(
        getComponent({
          options: {
            groups: [
              {
                name: 'Group 1',
                items: [
                  {
                    name: 'value',
                  },
                ],
              },
            ] as any,
            autoScroll: true,
          } as any,
        })
      );

      expect(scrollTo).toHaveBeenCalledWith({ top: 40 });
    });

    it('Should scroll to selected element if panel is not focused', () => {
      const { rerender } = render(
        <OutsideWrapper>
          {getComponent({
            options: {
              groups: [
                {
                  name: 'Group 1',
                  items: [
                    {
                      name: 'value',
                    },
                  ],
                },
              ] as any,
              autoScroll: true,
            } as any,
          })}
        </OutsideWrapper>
      );

      /**
       * Make panel is not focused
       */
      fireEvent.mouseDown(screen.getByTestId(TestIds.tableView.root));
      fireEvent.click(screen.getByTestId(InTestIds.outsideElement));

      scrollTo.mockClear();

      rerender(
        <OutsideWrapper>
          {getComponent({
            options: {
              groups: [
                {
                  name: 'Group 1',
                  items: [
                    {
                      name: 'value',
                    },
                  ],
                },
              ] as any,
              autoScroll: true,
            } as any,
          })}
        </OutsideWrapper>
      );

      expect(scrollTo).toHaveBeenCalled();
    });

    it('Should not scroll to selected element if panel is focused', () => {
      const { rerender } = render(
        <OutsideWrapper>
          {getComponent({
            options: {
              groups: [
                {
                  name: 'Group 1',
                  items: [
                    {
                      name: 'value',
                    },
                  ],
                },
              ] as any,
              autoScroll: true,
            } as any,
          })}
        </OutsideWrapper>
      );

      scrollTo.mockClear();

      /**
       * Make panel is focused
       */
      fireEvent.mouseDown(screen.getByTestId(TestIds.tableView.root));

      rerender(
        <OutsideWrapper>
          {getComponent({
            options: {
              groups: [
                {
                  name: 'Group 1',
                  items: [
                    {
                      name: 'value',
                    },
                  ],
                },
              ] as any,
              autoScroll: true,
            } as any,
          })}
        </OutsideWrapper>
      );

      expect(scrollTo).not.toHaveBeenCalled();
    });
  });
});

import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { toDataFrame } from '@grafana/data';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import { TestIds } from '../../constants';
import { LevelsEditor } from '../LevelsEditor';
import { GroupsEditor } from './GroupsEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof GroupsEditor>;

/**
 * Mock @grafana/ui
 */
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  Collapse: jest.fn(({ children, isOpen, label, onToggle }) => {
    return (
      <>
        <div onClick={onToggle}>{label}</div>
        {isOpen ? children : null}
      </>
    );
  }),
}));

/**
 * Mock LevelsEditor
 */
jest.mock('../LevelsEditor', () => ({
  LevelsEditor: jest.fn(() => <div data-testid={TestIds.levelsEditor.root} />),
}));

/**
 * Mock react-beautiful-dnd
 */
jest.mock('react-beautiful-dnd', () => ({
  ...jest.requireActual('react-beautiful-dnd'),
  DragDropContext: jest.fn(({ children }) => children),
  Droppable: jest.fn(({ children }) => children({})),
  Draggable: jest.fn(({ children }) =>
    children(
      {
        draggableProps: {},
      },
      {}
    )
  ),
}));

/**
 * In Test Ids
 */
const InTestIds = {
  buttonLevelsUpdate: 'data-testid button-levels-update',
};

describe('GroupsEditor', () => {
  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: Partial<Props>) => <GroupsEditor {...(props as any)} />;

  const dataFrameA = toDataFrame({
    fields: [
      {
        name: 'field1',
      },
      {
        name: 'field2',
      },
    ],
    refId: 'A',
  });

  const dataFrameB = toDataFrame({
    fields: [
      {
        name: 'fieldB1',
      },
      {
        name: 'fieldB2',
      },
    ],
    refId: 'B',
  });

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TestIds.groupsEditor,
    ...InTestIds,
  });
  const selectors = getSelectors(screen);

  /**
   * Levels Selectors
   */
  const getLevelsSelectors = getJestSelectors(TestIds.levelsEditor);
  const levelsSelectors = getLevelsSelectors(screen);

  it('Should render groups', () => {
    render(
      getComponent({
        context: {
          data: [dataFrameA],
          options: {
            groups: [
              {
                name: 'group1',
                items: [],
              },
              {
                name: 'group2',
                items: [],
              },
            ],
          } as any,
        } as any,
      })
    );

    expect(selectors.item(false, 'group1')).toBeInTheDocument();
    expect(selectors.item(false, 'group2')).toBeInTheDocument();
  });

  it('Should render if groups unspecified', () => {
    render(
      getComponent({
        context: {
          data: [dataFrameA],
          options: {} as any,
        } as any,
      })
    );

    expect(selectors.newItem()).toBeInTheDocument();
  });

  it('Should add new group', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            groups: [
              {
                name: 'group1',
                items: [],
              },
            ],
          } as any,
        } as any,
        onChange,
      })
    );

    await act(() => fireEvent.change(selectors.newItemName(), { target: { value: 'group2' } }));

    expect(selectors.buttonAddNew()).toBeInTheDocument();
    expect(selectors.buttonAddNew()).not.toBeDisabled();

    await act(() => fireEvent.click(selectors.buttonAddNew()));

    expect(onChange).toHaveBeenCalledWith([
      { name: 'group1', items: [] },
      { name: 'group2', items: [] },
    ]);
  });

  it('Should remove group', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            groups: [
              {
                name: 'group1',
                items: [],
              },
              {
                name: 'group2',
                items: [],
              },
            ],
          } as any,
        } as any,
        onChange,
      })
    );

    const item2 = selectors.item(false, 'group2');
    const item2Selectors = getSelectors(within(item2));

    /**
     * Check field presence
     */
    expect(item2).toBeInTheDocument();

    /**
     * Remove
     */
    await act(() => fireEvent.click(item2Selectors.buttonRemove()));

    expect(onChange).toHaveBeenCalledWith([{ name: 'group1', items: [] }]);
  });

  describe('Rename', () => {
    it('Should save new group name', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
            options: {
              groups: [
                {
                  name: 'group1',
                  items: [],
                },
                {
                  name: 'group2',
                  items: [],
                },
              ],
            } as any,
          } as any,
          onChange,
        })
      );

      const item1 = selectors.item(false, 'group1');
      const item1Selectors = getSelectors(within(item1));
      const item2 = selectors.item(false, 'group2');
      const item2Selectors = getSelectors(within(item2));

      /**
       * Check item presence
       */
      expect(item2).toBeInTheDocument();

      /**
       * Check rename is not started
       */
      expect(item1Selectors.fieldName(true)).not.toBeInTheDocument();
      expect(item2Selectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(item2Selectors.buttonStartRename()));

      /**
       * Check rename is started only for item2
       */
      expect(item1Selectors.fieldName(true)).not.toBeInTheDocument();
      expect(item2Selectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(item2Selectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Save Name
       */
      expect(item2Selectors.buttonSaveRename()).not.toBeDisabled();
      fireEvent.click(item2Selectors.buttonSaveRename());

      /**
       * Check if saved
       */
      expect(onChange).toHaveBeenCalledWith([
        { name: 'group1', items: [] },
        { name: 'hello', items: [] },
      ]);
    });

    it('Should cancel renaming', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
            options: {
              groups: [
                {
                  name: 'group1',
                  items: [],
                },
                {
                  name: 'group2',
                  items: [],
                },
              ],
            } as any,
          } as any,
          onChange,
        })
      );

      const item = selectors.item(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Cancel Renaming
       */
      expect(itemSelectors.buttonCancelRename()).not.toBeDisabled();
      fireEvent.click(itemSelectors.buttonCancelRename());

      /**
       * Check if renaming canceled
       */
      expect(itemSelectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Check if not saved
       */
      expect(onChange).not.toHaveBeenCalled();
    });

    it('Should not allow to save invalid name', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
            options: {
              groups: [
                {
                  name: 'group1',
                  items: [],
                },
                {
                  name: 'group2',
                  items: [],
                },
              ],
            } as any,
          } as any,
          onChange,
        })
      );

      const item = selectors.item(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'group1' } });

      /**
       * Check if unable to save
       */
      expect(itemSelectors.buttonSaveRename()).toBeDisabled();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: '' } });

      /**
       * Check if unable to save
       */
      expect(itemSelectors.buttonSaveRename()).toBeDisabled();
    });

    it('Should save name by enter', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
            options: {
              groups: [
                {
                  name: 'group1',
                  items: [],
                },
                {
                  name: 'group2',
                  items: [],
                },
              ],
            } as any,
          } as any,
          onChange,
        })
      );

      const item = selectors.item(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Press Enter
       */
      await act(async () => fireEvent.keyDown(selectors.fieldName(), { key: 'Enter' }));

      /**
       * Check if saved
       */
      expect(onChange).toHaveBeenCalledWith([
        { name: 'group1', items: [] },
        { name: 'hello', items: [] },
      ]);
    });

    it('Should cancel renaming by escape', async () => {
      const onChange = jest.fn();

      render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
            options: {
              groups: [
                {
                  name: 'group1',
                  items: [],
                },
                {
                  name: 'group2',
                  items: [],
                },
              ],
            } as any,
          } as any,
          onChange,
        })
      );

      const item = selectors.item(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Press Escape
       */
      await act(async () => fireEvent.keyDown(selectors.fieldName(), { key: 'Escape' }));

      /**
       * Check if renaming canceled
       */
      expect(itemSelectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Check if not saved
       */
      expect(onChange).not.toHaveBeenCalled();
    });

    it('Should keep toggled state after save', async () => {
      let options = {
        groups: [
          {
            name: 'group1',
            items: [],
          },
          {
            name: 'group2',
            items: [],
          },
        ],
      };
      const onChange = jest.fn((updated) => (options = updated));

      const { rerender } = render(
        getComponent({
          context: {
            data: [dataFrameA, dataFrameB],
            options,
          } as any,
          onChange,
        })
      );

      const item = selectors.item(false, 'group2');
      const itemSelectors = getSelectors(within(item));

      /**
       * Check item presence
       */
      expect(item).toBeInTheDocument();

      /**
       * Expand Item
       */
      fireEvent.click(item);

      /**
       * Check if item expanded
       */
      expect(levelsSelectors.root()).toBeInTheDocument();

      /**
       * Check rename is not started
       */
      expect(itemSelectors.fieldName(true)).not.toBeInTheDocument();

      /**
       * Start Renaming
       */
      await act(() => fireEvent.click(itemSelectors.buttonStartRename()));

      /**
       * Check rename is started
       */
      expect(itemSelectors.fieldName()).toBeInTheDocument();

      /**
       * Change name
       */
      fireEvent.change(itemSelectors.fieldName(), { target: { value: 'hello' } });

      /**
       * Save Name
       */
      expect(itemSelectors.buttonSaveRename()).not.toBeDisabled();
      fireEvent.click(itemSelectors.buttonSaveRename());

      /**
       * Check if saved
       */
      expect(onChange).toHaveBeenCalledWith([
        { name: 'group1', items: [] },
        { name: 'hello', items: [] },
      ]);

      /**
       * Rerender
       */
      rerender(
        getComponent({
          context: {
            options: options as any,
          } as any,
        })
      );

      /**
       * Check if item still expanded
       */
      expect(levelsSelectors.root()).toBeInTheDocument();
    });
  });

  it('Should show group content', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            groups: [
              {
                name: 'group1',
                items: [],
              },
              {
                name: 'group2',
                items: [],
              },
            ],
          } as any,
        } as any,
        onChange,
      })
    );

    const item1 = selectors.item(false, 'group1');

    /**
     * Check field presence
     */
    expect(item1).toBeInTheDocument();

    /**
     * Open
     */
    await act(() => fireEvent.click(item1));

    expect(levelsSelectors.root()).toBeInTheDocument();
  });

  it('Should update item', () => {
    const onChange = jest.fn();

    jest.mocked(LevelsEditor).mockImplementation(({ name, onChange }) => (
      <div data-testid={TestIds.levelsEditor.root}>
        <button
          data-testid={InTestIds.buttonLevelsUpdate}
          onClick={() =>
            onChange({
              name,
              items: [],
            })
          }
        />
      </div>
    ));

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'field 2',
                  },
                  {
                    name: 'field1',
                  },
                ],
              },
              {
                name: 'group2',
                items: [
                  {
                    name: 'field1',
                  },
                ],
              },
            ],
          } as any,
        } as any,
        onChange,
      })
    );

    /**
     * Open group1
     */
    fireEvent.click(selectors.item(false, 'group1'));

    /**
     * Simulate group change
     */
    fireEvent.click(selectors.buttonLevelsUpdate());

    expect(onChange).toHaveBeenCalledWith([
      {
        name: 'group1',
        items: [],
      },
      {
        name: 'group2',
        items: [
          {
            name: 'field1',
          },
        ],
      },
    ]);
  });

  it('Should reorder items', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};
    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'field 2',
                  },
                  {
                    name: 'field1',
                  },
                ],
              },
              {
                name: 'group2',
                items: [
                  {
                    name: 'field1',
                  },
                ],
              },
            ],
          } as any,
        } as any,
        onChange,
      })
    );

    /**
     * Simulate drop field 1 to index 0
     */
    await act(() =>
      onDragEndHandler({
        destination: {
          index: 0,
        },
        source: {
          index: 1,
        },
      } as any)
    );

    expect(onChange).toHaveBeenCalledWith([
      {
        name: 'group2',
        items: expect.any(Array),
      },
      {
        name: 'group1',
        items: expect.any(Array),
      },
    ]);
  });

  it('Should not reorder items if drop outside the list', async () => {
    let onDragEndHandler: (result: DropResult) => void = () => {};
    jest.mocked(DragDropContext).mockImplementation(({ children, onDragEnd }: any) => {
      onDragEndHandler = onDragEnd;
      return children;
    });
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            groups: [
              {
                name: 'group1',
                items: [
                  {
                    name: 'field 2',
                  },
                  {
                    name: 'field1',
                  },
                ],
              },
              {
                name: 'group2',
                items: [
                  {
                    name: 'field1',
                  },
                ],
              },
            ],
          } as any,
        } as any,
        onChange,
      })
    );

    /**
     * Simulate drop field 1 to outside the list
     */
    await act(() =>
      onDragEndHandler({
        destination: null,
        source: {
          index: 1,
        },
      } as any)
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});

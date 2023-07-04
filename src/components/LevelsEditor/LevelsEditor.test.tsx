import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { toDataFrame } from '@grafana/data';
import { Select } from '@grafana/ui';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { TestIds } from '../../constants';
import { LevelsEditor } from './LevelsEditor';

/**
 * Mock @grafana/ui
 */
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  /**
   * Mock Select component
   */
  Select: jest.fn().mockImplementation(({ options, onChange, value, ...restProps }) => (
    <select
      onChange={(event: any) => {
        if (onChange) {
          onChange(options.find((option: any) => option.value === event.target.value));
        }
      }}
      /**
       * Fix jest warnings because null value.
       * For Select component in @grafana/ui should be used null to reset value.
       */
      value={value === null ? '' : value}
      {...restProps}
    >
      {options.map(({ label, value }: any) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )),
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
 * Props
 */
type Props = React.ComponentProps<typeof LevelsEditor>;

describe('LevelsEditor', () => {
  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: Partial<Props>) => <LevelsEditor name="Default" {...(props as any)} />;

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

  it('Should render levels', () => {
    render(
      getComponent({
        data: [dataFrameA],
        items: [
          {
            name: 'field1',
            source: 'A',
          },
          {
            name: 'field2',
            source: 'A',
          },
        ],
      })
    );

    expect(screen.getByTestId(TestIds.levelsEditor.item('field1'))).toBeInTheDocument();
    expect(screen.getByTestId(TestIds.levelsEditor.item('field2'))).toBeInTheDocument();
  });

  it('Should allow select any fields', () => {
    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        items: [],
      })
    );

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          {
            value: 'A:field1',
            source: 'A',
            fieldName: 'field1',
            label: 'A:field1',
          },
          {
            value: 'A:field2',
            source: 'A',
            fieldName: 'field2',
            label: 'A:field2',
          },
          {
            value: 'B:fieldB1',
            source: 'B',
            fieldName: 'fieldB1',
            label: 'B:fieldB1',
          },
          {
            value: 'B:fieldB2',
            source: 'B',
            fieldName: 'fieldB2',
            label: 'B:fieldB2',
          },
        ],
      }),
      expect.anything()
    );
  });

  it('Should allow select fields only from the current data frame', () => {
    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        items: [
          {
            name: 'field1',
            source: 'A',
          },
        ],
      })
    );

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          {
            value: 'field2',
            source: 'A',
            fieldName: 'field2',
            label: 'field2',
          },
        ],
      }),
      expect.anything()
    );
  });

  it('Should add new level', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        name: 'Group 1',
        items: [
          {
            name: 'field1',
            source: 'A',
          },
        ],
        onChange,
      })
    );

    await act(() =>
      fireEvent.change(screen.getByLabelText(TestIds.levelsEditor.newItemName), { target: { value: 'field2' } })
    );

    expect(screen.getByTestId(TestIds.levelsEditor.buttonAddNew)).toBeInTheDocument();
    expect(screen.getByTestId(TestIds.levelsEditor.buttonAddNew)).not.toBeDisabled();

    await act(() => fireEvent.click(screen.getByTestId(TestIds.levelsEditor.buttonAddNew)));

    expect(onChange).toHaveBeenCalledWith({
      name: 'Group 1',
      items: [
        { name: 'field1', source: 'A' },
        { name: 'field2', source: 'A' },
      ],
    });
  });

  it('Should remove level', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        data: [dataFrameA, dataFrameB],
        name: 'Group 1',
        items: [
          {
            name: 'field2',
            source: 'A',
          },
          {
            name: 'field1',
            source: 'A',
          },
        ],
        onChange,
      })
    );

    const field2 = screen.getByTestId(TestIds.levelsEditor.item('field2'));

    /**
     * Check field presence
     */
    expect(field2).toBeInTheDocument();

    /**
     * Remove
     */
    await act(() => fireEvent.click(within(field2).getByTestId(TestIds.levelsEditor.buttonRemove)));

    expect(onChange).toHaveBeenCalledWith({ name: 'Group 1', items: [{ name: 'field1', source: 'A' }] });
  });

  it('Should render without errors if dataFrame was removed', () => {
    render(
      getComponent({
        data: [dataFrameB],
        name: 'Group 1',
        items: [
          {
            name: 'field1',
            source: 'A',
          },
        ],
      })
    );

    expect(screen.getByTestId(TestIds.levelsEditor.root)).toBeInTheDocument();
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
        data: [dataFrameA, dataFrameB],
        name: 'Group 1',
        items: [
          {
            name: 'field2',
            source: 'A',
          },
          {
            name: 'field1',
            source: 'A',
          },
        ],
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

    expect(onChange).toHaveBeenCalledWith({
      name: 'Group 1',
      items: [
        {
          name: 'field1',
          source: 'A',
        },
        {
          name: 'field2',
          source: 'A',
        },
      ],
    });
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
        data: [dataFrameA, dataFrameB],
        name: 'Group 1',
        items: [
          {
            name: 'field2',
            source: 'A',
          },
          {
            name: 'field1',
            source: 'A',
          },
        ],
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

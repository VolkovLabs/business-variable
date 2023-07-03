import React from 'react';
import { toDataFrame } from '@grafana/data';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { TestIds } from '../../constants';
import { FieldsEditor } from './FieldsEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof FieldsEditor>;

describe('FieldsEditor', () => {
  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: Partial<Props>) => <FieldsEditor {...(props as any)} />;

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

    expect(screen.getByTestId(TestIds.fieldsEditor.item('group1'))).toBeInTheDocument();
    expect(screen.getByTestId(TestIds.fieldsEditor.item('group2'))).toBeInTheDocument();
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

    await act(() =>
      fireEvent.change(screen.getByTestId(TestIds.fieldsEditor.newItemName), { target: { value: 'group2' } })
    );

    expect(screen.getByTestId(TestIds.fieldsEditor.buttonAddNew)).toBeInTheDocument();
    expect(screen.getByTestId(TestIds.fieldsEditor.buttonAddNew)).not.toBeDisabled();

    await act(() => fireEvent.click(screen.getByTestId(TestIds.fieldsEditor.buttonAddNew)));

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

    const item2 = screen.getByTestId(TestIds.fieldsEditor.item('group2'));

    /**
     * Check field presence
     */
    expect(item2).toBeInTheDocument();

    /**
     * Remove
     */
    await act(() => fireEvent.click(within(item2).getByTestId(TestIds.fieldsEditor.buttonRemove)));

    expect(onChange).toHaveBeenCalledWith([{ name: 'group1', items: [] }]);
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

    const item1 = screen.getByTestId(TestIds.fieldsEditor.item('group1'));

    /**
     * Check field presence
     */
    expect(item1).toBeInTheDocument();

    /**
     * Open
     */
    await act(() => fireEvent.click(item1));

    expect(screen.getByTestId(TestIds.levelsEditor.root)).toBeInTheDocument();
  });
});

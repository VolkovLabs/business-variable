import React from 'react';
import { toDataFrame } from '@grafana/data';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { TestIds } from '../../constants';
import { GroupsEditor } from './GroupsEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof GroupsEditor>;

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

    expect(screen.getByTestId(TestIds.groupsEditor.item('group1'))).toBeInTheDocument();
    expect(screen.getByTestId(TestIds.groupsEditor.item('group2'))).toBeInTheDocument();
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
      fireEvent.change(screen.getByTestId(TestIds.groupsEditor.newItemName), { target: { value: 'group2' } })
    );

    expect(screen.getByTestId(TestIds.groupsEditor.buttonAddNew)).toBeInTheDocument();
    expect(screen.getByTestId(TestIds.groupsEditor.buttonAddNew)).not.toBeDisabled();

    await act(() => fireEvent.click(screen.getByTestId(TestIds.groupsEditor.buttonAddNew)));

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

    const item2 = screen.getByTestId(TestIds.groupsEditor.item('group2'));

    /**
     * Check field presence
     */
    expect(item2).toBeInTheDocument();

    /**
     * Remove
     */
    await act(() => fireEvent.click(within(item2).getByTestId(TestIds.groupsEditor.buttonRemove)));

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

    const item1 = screen.getByTestId(TestIds.groupsEditor.item('group1'));

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

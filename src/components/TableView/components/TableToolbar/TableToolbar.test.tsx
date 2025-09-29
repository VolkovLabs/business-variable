import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React, { useRef } from 'react';

import { TEST_IDS } from '../../../../constants';

import { TableViewPosition, ToolbarMode } from '../../../../types';
import { TableToolbar } from './TableToolbar';

/**
 * Properties
 */
type Props = React.ComponentProps<typeof TableToolbar>;

/**
 * Table Toolbar View
 */
describe('Table Toolbar View', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.tableToolbar });
  const selectors = getSelectors(screen);

  /**
   * Wrapper with ref
   * @param props
   * @constructor
   */
  const Wrapper = (props: any) => {
    const ref = useRef<HTMLDivElement>(null);
    /**
     * Should scroll
     */
    const shouldScroll = useRef<boolean>(false);

    return (
      <div>
        <TableToolbar headerRef={ref} shouldScroll={shouldScroll} {...props} />
      </div>
    );
  };

  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: Partial<Props>) => <Wrapper {...props} />;

  it('Should render container', () => {
    const setPinnedGroups = jest.fn();
    const setCurrentGroup = jest.fn();

    render(
      getComponent({
        setPinnedGroups: setPinnedGroups,
        setCurrentGroup: setCurrentGroup,
        sortedGroups: [],
        currentGroup: '',
        safePinnedGroups: [],
        options: {} as any,
      })
    );

    expect(selectors.root()).toBeInTheDocument();
  });

  it('Should switch groups and setCurrentGroup call', () => {
    const setPinnedGroups = jest.fn();
    const setCurrentGroup = jest.fn();

    const shouldScroll = {
      current: false,
    };

    render(
      getComponent({
        shouldScroll: shouldScroll,
        setPinnedGroups: setPinnedGroups,
        setCurrentGroup: setCurrentGroup,
        sortedGroups: [
          { name: 'group1', items: [{ name: 'group1Field' }] },
          { name: 'group2', items: [{ name: 'group2Field' }] },
        ] as any,
        currentGroup: 'group1',
        safePinnedGroups: [],
        options: {
          toolbarMode: ToolbarMode.TABS,
          tableViewPosition: TableViewPosition.NORMAL,
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

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.tab(false, 'group1')).toBeInTheDocument();
    expect(selectors.tab(false, 'group2')).toBeInTheDocument();

    fireEvent.click(selectors.tab(false, 'group2'));

    expect(setCurrentGroup).toHaveBeenCalled();
    expect(shouldScroll.current).toBeTruthy();
  });

  it('Should toggle pin group', () => {
    const setPinnedGroups = jest.fn();
    const setCurrentGroup = jest.fn();

    const shouldScroll = {
      current: false,
    };

    render(
      getComponent({
        shouldScroll: shouldScroll,
        setPinnedGroups: setPinnedGroups,
        setCurrentGroup: setCurrentGroup,
        sortedGroups: [
          { name: 'group1', items: [{ name: 'group1Field' }] },
          { name: 'group2', items: [{ name: 'group2Field' }] },
        ] as any,
        currentGroup: 'group1',
        safePinnedGroups: ['group1'],
        options: {
          toolbarMode: ToolbarMode.TABS,
          isPinTabsEnabled: true,
          tableViewPosition: TableViewPosition.NORMAL,
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

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.tab(false, 'group1')).toBeInTheDocument();
    expect(selectors.tab(false, 'group2')).toBeInTheDocument();

    expect(selectors.pinButton(false, 'group1')).toBeInTheDocument();
    expect(selectors.pinButton(false, 'group2')).toBeInTheDocument();

    fireEvent.click(selectors.pinButton(false, 'group2'));

    expect(setPinnedGroups).toHaveBeenCalled();
    expect(setPinnedGroups).toHaveBeenCalledWith(expect.any(Function));

    const updateFunction = setPinnedGroups.mock.calls[0][0];
    const testPreviousGroups = ['group1'];

    const result = updateFunction(testPreviousGroups);

    expect(result).toBeDefined();
  });

  it('Should switch groups via Select', () => {
    const setPinnedGroups = jest.fn();
    const setCurrentGroup = jest.fn();

    const shouldScroll = {
      current: false,
    };

    render(
      getComponent({
        shouldScroll: shouldScroll,
        setPinnedGroups: setPinnedGroups,
        setCurrentGroup: setCurrentGroup,
        sortedGroups: [
          { name: 'group1', items: [{ name: 'group1Field' }] },
          { name: 'group2', items: [{ name: 'group2Field' }] },
        ] as any,
        currentGroup: 'group1',
        safePinnedGroups: [],
        options: {
          toolbarMode: ToolbarMode.SELECT,
          tableViewPosition: TableViewPosition.NORMAL,
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

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.fieldSelectGroup()).toBeInTheDocument();

    fireEvent.change(selectors.fieldSelectGroup(), { target: { value: 'group2' } });

    expect(setCurrentGroup).toHaveBeenCalled();
    expect(setCurrentGroup).toHaveBeenCalledWith('group2');
  });
});

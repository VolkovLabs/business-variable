import { cx } from '@emotion/css';
import { Icon, Select, ToolbarButton, ToolbarButtonRow, useTheme2 } from '@grafana/ui';
import React, { useCallback, useMemo } from 'react';
import { preparedPinnedGroups } from 'utils';

import { TEST_IDS } from '../../../../constants';
import { LevelsGroup, PanelOptions, ToolbarMode } from '../../../../types';
import { getStyles } from './TableToolbar.styles';

/**
 * Set Value Action
 */
type SetValueAction<TValue> = TValue | ((value: TValue) => TValue);

interface TableToolbarProps {
  /**
   * Options
   */
  options: PanelOptions;

  /**
   * header ref
   */
  headerRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Sorted Groups
   */
  sortedGroups: LevelsGroup[];

  /**
   * Current Group
   */
  currentGroup: string;

  /**
   * Safe pinned Groups
   */
  safePinnedGroups: string[];

  /**
   * Safe Current Group
   */
  setCurrentGroup: React.Dispatch<SetValueAction<string>>;

  /**
   * Should scroll
   */
  shouldScroll: React.RefObject<boolean>;

  /**
   * Set pinned groups action
   */
  setPinnedGroups: React.Dispatch<SetValueAction<string[]>>;
}

/**
 * Table toolbar
 */
export const TableToolbar = ({
  options,
  headerRef,
  sortedGroups,
  currentGroup,
  safePinnedGroups,
  setCurrentGroup,
  shouldScroll,
  setPinnedGroups,
}: TableToolbarProps) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * Key use for correct rerender row when tabs is changed in live
   */
  const toolbarRowKey = useMemo(() => {
    const groupNames = sortedGroups.map((srtGroup) => srtGroup.name).join();
    const key = currentGroup + groupNames;
    return key;
  }, [currentGroup, sortedGroups]);

  /**
   * Toggle pin status for a group
   * If group is already pinned - remove it from pinned list
   * If group is not pinned - add it to the end of pinned list
   * @param groupName - Name of the group to pin/unpin
   */
  const togglePinGroup = useCallback(
    (groupName: string) => {
      setPinnedGroups((previousPinnedGroups) => {
        return preparedPinnedGroups(previousPinnedGroups, groupName);
      });
    },
    [setPinnedGroups]
  );

  /**
   * Options for select view
   */
  const selectViewOptions = sortedGroups.map((group) => ({
    label: group.name,
    value: group.name,
  }));

  return (
    <div ref={headerRef} className={styles.header} {...TEST_IDS.tableToolbar.root.apply()}>
      {options.toolbarMode === ToolbarMode.TABS && (
        <ToolbarButtonRow alignment="left" key={toolbarRowKey} className={styles.toolbar}>
          {sortedGroups.map((group) => {
            const isPinned = safePinnedGroups.includes(group.name);
            const isActive = currentGroup === group.name;

            return (
              <div key={group.name} className={styles.tabWithPin}>
                <ToolbarButton
                  variant={isActive ? 'active' : 'default'}
                  onClick={() => {
                    setCurrentGroup(group.name);
                    shouldScroll.current = true;
                  }}
                  className={cx(styles.toolbarButton)}
                  {...TEST_IDS.tableToolbar.tab.apply(group.name)}
                >
                  <span className={styles.tabContent}>
                    <span className={styles.tabText}>{group.name}</span>
                    {options.isPinTabsEnabled && (
                      <Icon
                        name="gf-pin"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinGroup(group.name);
                        }}
                        className={cx(styles.pinButton, {
                          [styles.pinButtonActive]: isPinned,
                        })}
                        title={isPinned ? 'Unpin tab' : 'Pin tab'}
                        aria-label={isPinned ? 'Unpin tab' : 'Pin tab'}
                        {...TEST_IDS.tableToolbar.pinButton.apply(group.name)}
                      />
                    )}
                  </span>
                </ToolbarButton>
              </div>
            );
          })}
        </ToolbarButtonRow>
      )}
      {options.toolbarMode === ToolbarMode.SELECT && (
        <div className={styles.selectContainer}>
          <Select
            options={selectViewOptions}
            value={currentGroup}
            onChange={(event) => {
              setCurrentGroup(event.value!);
            }}
            aria-label={TEST_IDS.tableToolbar.fieldSelectGroup}
          />
        </div>
      )}
    </div>
  );
};

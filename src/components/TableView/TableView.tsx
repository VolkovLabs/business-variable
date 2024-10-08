import { css, cx } from '@emotion/css';
import { EventBus, PanelProps } from '@grafana/data';
import { Alert, ClickOutsideWrapper, ToolbarButton, ToolbarButtonRow, useTheme2 } from '@grafana/ui';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { TEST_IDS } from '../../constants';
import { useContentPosition, useContentSizes, useSavedState, useTable } from '../../hooks';
import { PanelOptions } from '../../types';
import { Table } from '../Table';
import { getStyles } from './TableView.styles';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {
  /**
   * Panel Event Bus
   */
  panelEventBus: EventBus;
}

/**
 * Table View
 */
export const TableView: React.FC<Props> = ({
  data,
  id,
  options,
  width,
  height,
  eventBus,
  panelEventBus,
  replaceVariables,
}) => {
  /**
   * Current group
   */
  const [currentGroup, setCurrentGroup] = useSavedState<string>({
    key: `volkovlabs.variable.panel.${options.saveSelectedGroupKey || id}`,
    initialValue: options.groups?.[0]?.name || '',
    enabled: options.saveSelectedGroup,
  });

  /**
   * Current Levels
   */
  const currentLevels = useMemo(() => {
    if (options.groups?.length && currentGroup) {
      return options.groups.find((group) => group.name === currentGroup)?.items;
    }
    return;
  }, [options.groups, currentGroup]);

  /**
   * Change current group if was removed
   */
  useEffect(() => {
    if (!options.groups?.some((group) => group.name === currentGroup)) {
      setCurrentGroup(options.groups?.[0]?.name || '');
    }
  }, [currentGroup, id, options.groups, setCurrentGroup]);

  /**
   * Table config
   */
  const { tableData, columns, getSubRows } = useTable({
    data,
    options,
    eventBus,
    levels: currentLevels,
    panelEventBus,
    replaceVariables,
  });

  /**
   * Content Sizes
   */
  const {
    containerRef: scrollableContainerRef,
    tableRef,
    headerRef,
    tableTopOffset,
    tableHeaderRef,
  } = useContentSizes({ height, options, tableData });

  /**
   * Sticky position
   */
  const { containerRef, style } = useContentPosition({
    width,
    height,
    sticky: options.sticky,
    scrollableContainerRef,
  });

  /**
   * Is Panel Focused
   */
  const isFocused = useRef<boolean>(false);

  /**
   * Should scroll
   */
  const shouldScroll = useRef<boolean>(false);

  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * Show selected group first
   */
  const sortedGroups = useMemo(() => {
    if (!options.groups) {
      return [];
    }

    /**
     * Find active selected group
     */
    const activeGroup = options.groups.find((group) => group.name === currentGroup);

    /**
     * Selected group is not found
     */
    if (!activeGroup || options.tabsInOrder) {
      return options.groups;
    }

    /**
     * Filter groups, exclude active group
     */
    const withoutActive = options.groups.filter((group) => group.name !== currentGroup);

    return [activeGroup, ...withoutActive];
  }, [currentGroup, options.groups, options.tabsInOrder]);

  /**
   * On after scroll
   */
  const onAfterScroll = useCallback(() => {
    shouldScroll.current = false;
  }, []);

  /**
   * Return
   */
  return (
    <ClickOutsideWrapper
      onClick={() => {
        if (isFocused.current) {
          isFocused.current = false;
        }
      }}
      useCapture={true}
    >
      <div
        data-testid={TEST_IDS.tableView.root}
        className={cx(
          styles.wrapper,
          css`
            width: ${width}px;
            height: ${height}px;
          `
        )}
        ref={containerRef}
        onMouseDown={() => {
          isFocused.current = true;
        }}
      >
        {!tableData.length && (
          <Alert data-testid={TEST_IDS.tableView.infoMessage} severity="info" title="Variable">
            Variable is not selected or do not match returned fields.
          </Alert>
        )}

        <div
          style={style}
          className={styles.content}
          ref={scrollableContainerRef}
          data-testid={TEST_IDS.tableView.content}
        >
          {sortedGroups.length > 1 && (
            <div ref={headerRef} className={styles.header}>
              <ToolbarButtonRow alignment="left" key={currentGroup} className={styles.toolbar}>
                {sortedGroups.map((group, index) => (
                  <ToolbarButton
                    key={group.name}
                    variant={currentGroup === group.name ? 'active' : 'default'}
                    onClick={() => {
                      setCurrentGroup(group.name);
                      shouldScroll.current = true;
                    }}
                    data-testid={TEST_IDS.tableView.tab(group.name)}
                    className={styles.toolbarButton}
                    style={{
                      maxWidth: index === 0 ? width - 60 : undefined,
                    }}
                  >
                    {group.name}
                  </ToolbarButton>
                ))}
              </ToolbarButtonRow>
            </div>
          )}
          <Table
            key={currentGroup}
            columns={columns}
            data={tableData}
            getSubRows={getSubRows}
            showHeader={options.header}
            tableRef={tableRef}
            tableHeaderRef={tableHeaderRef}
            topOffset={tableTopOffset}
            scrollableContainerRef={scrollableContainerRef}
            alwaysVisibleFilter={options.alwaysVisibleFilter}
            isFocused={isFocused}
            autoScroll={options.autoScroll}
            shouldScroll={shouldScroll}
            onAfterScroll={onAfterScroll}
            collapsedByDefault={options.collapsedByDefault}
            eventBus={panelEventBus}
          />
        </div>
      </div>
    </ClickOutsideWrapper>
  );
};

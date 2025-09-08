import { css, cx } from '@emotion/css';
import { EventBus, PanelProps } from '@grafana/data';
import { ClickOutsideWrapper, Drawer, Icon, Tooltip, useTheme2 } from '@grafana/ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/naming-convention
import ReactDOM from 'react-dom';

import { TEST_IDS } from '../../constants';
import { useContentPosition, useContentSizes, useDockMenuPosition, useSavedState, useTable } from '../../hooks';
import { PanelOptions, TableViewPosition } from '../../types';
import { prepareSafePinnedGroups, prepareSortedGroups, prepareTableSizes } from '../../utils';
import { Table } from '../Table';
import { DrawerTable, TableErrorMessage, TableMinimizeView, TableToolbar, ToggleDockMenuButtons } from './components';
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
   * State
   */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { dockedMenuSize, dockMenuToggle, isDockMenuDisplay, dockMenuPosition, buttonTogglePosition, forceRerender } =
    useDockMenuPosition({
      position: options.tableViewPosition,
    });

  /**
   * Current group
   */
  const [currentGroup, setCurrentGroup, groupLoaded] = useSavedState<string>({
    key: `volkovlabs.variable.panel.${options.saveSelectedGroupKey || id}`,
    initialValue: options.groups?.[0]?.name || '',
    enabled: options.saveSelectedGroup,
  });

  /**
   * Pinned groups state
   * Array of pinned tab names stored in localStorage
   */
  const [pinnedGroups, setPinnedGroups, pinnedLoaded] = useSavedState<string[]>({
    key: `volkovlabs.variable.panel.pinned.${options.saveSelectedGroupKey || id}`,
    initialValue: [],
    enabled: options.isPinTabsEnabled === true,
  });

  /**
   * Safe pinned groups
   */
  const safePinnedGroups = useMemo(() => {
    return prepareSafePinnedGroups(pinnedGroups, options.isPinTabsEnabled);
  }, [pinnedGroups, options.isPinTabsEnabled]);

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
   * Validate current group
   */
  useEffect(() => {
    if (groupLoaded && options.groups && !options.groups.some((group) => group.name === currentGroup)) {
      setCurrentGroup(options.groups[0]?.name || '');
    }
  }, [currentGroup, groupLoaded, id, options.groups, setCurrentGroup]);

  /**
   * Clean up pinned groups
   */
  useEffect(() => {
    if (pinnedLoaded && options.groups && safePinnedGroups.length > 0) {
      const existingGroupNames = options.groups.map((group) => group.name);
      const validPinnedGroups = safePinnedGroups.filter((pinnedGroup) => existingGroupNames.includes(pinnedGroup));
      if (validPinnedGroups.length !== safePinnedGroups.length || !Array.isArray(pinnedGroups)) {
        setPinnedGroups(validPinnedGroups);
      }
    }
  }, [options.groups, safePinnedGroups, setPinnedGroups, pinnedLoaded, pinnedGroups]);

  /**
   * Table config
   */
  const { tableData, columns, getSubRows, runtimeVariable } = useTable({
    data,
    options,
    eventBus,
    levels: currentLevels,
    panelEventBus,
    replaceVariables,
  });

  const treeViewContainerSizes = useMemo(() => {
    return prepareTableSizes({
      tableViewPosition: options.tableViewPosition,
      dockedMenuSizes: dockedMenuSize,
      panelSizes: { width, height },
    });
  }, [dockedMenuSize, height, options.tableViewPosition, width]);

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
    width: treeViewContainerSizes.width,
    height: treeViewContainerSizes.height,
    sticky: options.tableViewPosition === TableViewPosition.STICKY,
    scrollableContainerRef,
    eventBus,
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
   * Sorted groups
   * Returns groups array with pinned groups first, then unpinned groups
   * If tabsInOrder is enabled, active group is shown after pinned groups
   */
  const sortedGroups = useMemo(() => {
    return prepareSortedGroups({
      groups: options.groups,
      isPinTabsEnabled: options.isPinTabsEnabled,
      pinnedLoaded: pinnedLoaded,
      safePinnedGroups: safePinnedGroups,
      tabsInOrder: options.tabsInOrder,
      currentGroup: currentGroup,
    });
  }, [currentGroup, options.groups, options.isPinTabsEnabled, options.tabsInOrder, pinnedLoaded, safePinnedGroups]);

  /**
   * On after scroll
   */
  const onAfterScroll = useCallback(() => {
    shouldScroll.current = false;
  }, []);

  /**
   * Error alert message
   */
  const errorMessage = useMemo(() => {
    return (
      <TableErrorMessage
        runtimeVariable={runtimeVariable}
        options={options}
        tableData={tableData}
        currentGroup={currentGroup}
      />
    );
  }, [currentGroup, options, runtimeVariable, tableData]);

  const renderToolbar = useMemo(() => {
    return (
      <TableToolbar
        options={options}
        headerRef={headerRef}
        sortedGroups={sortedGroups}
        currentGroup={currentGroup}
        safePinnedGroups={safePinnedGroups}
        setCurrentGroup={setCurrentGroup}
        shouldScroll={shouldScroll}
        setPinnedGroups={setPinnedGroups}
      />
    );
  }, [currentGroup, headerRef, options, safePinnedGroups, setCurrentGroup, setPinnedGroups, sortedGroups]);

  const renderMainTableContent = () => {
    return (
      <div
        data-testid={TEST_IDS.tableView.root}
        className={cx(
          styles.wrapper,
          css`
            width: ${treeViewContainerSizes.width}px;
            height: ${treeViewContainerSizes.height}px;
          `
        )}
        ref={containerRef}
        onMouseDown={() => {
          isFocused.current = true;
        }}
      >
        {errorMessage}
        <div
          style={style}
          className={styles.content}
          ref={scrollableContainerRef}
          data-testid={TEST_IDS.tableView.content}
        >
          {sortedGroups.length > 1 && renderToolbar}
          <Table
            forceRerender={forceRerender}
            key={currentGroup}
            tableViewPosition={options.tableViewPosition}
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
    );
  };

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
      {options.tableViewPosition === TableViewPosition.MINIMIZE && (
        <TableMinimizeView
          runtimeVariable={runtimeVariable}
          options={options}
          setIsDrawerOpen={setIsDrawerOpen}
          panelEventBus={panelEventBus}
          enableDrawerOpen={true}
        />
      )}
      {(options.tableViewPosition === TableViewPosition.NORMAL ||
        options.tableViewPosition === TableViewPosition.STICKY) &&
        renderMainTableContent()}
      {options.tableViewPosition === TableViewPosition.DOCKED &&
        dockMenuPosition.current &&
        ReactDOM.createPortal(renderMainTableContent(), dockMenuPosition.current)}

      {options.tableViewPosition === TableViewPosition.DOCKED &&
        buttonTogglePosition.current &&
        ReactDOM.createPortal(
          <ToggleDockMenuButtons isDockMenuDisplay={isDockMenuDisplay} dockMenuToggle={dockMenuToggle} />,
          buttonTogglePosition.current
        )}
      {options.tableViewPosition === TableViewPosition.DOCKED && (
        <div className={styles.dockedMinimizeView}>
          <div className={styles.dockedAlertIcon} {...TEST_IDS.tableView.dockedIcon.apply()}>
            <Tooltip content={<span>The tree view is displayed in the docked menu.</span>}>
              <Icon name="web-section-alt" size="md" />
            </Tooltip>
          </div>
          <TableMinimizeView
            runtimeVariable={runtimeVariable}
            options={options}
            setIsDrawerOpen={setIsDrawerOpen}
            panelEventBus={panelEventBus}
            enableDrawerOpen={false}
          />
        </div>
      )}
      {isDrawerOpen && (
        <Drawer title={sortedGroups.length > 1 && <>{renderToolbar}</>} onClose={() => setIsDrawerOpen(false)}>
          <DrawerTable
            forceRerender={forceRerender}
            tableViewPosition={options.tableViewPosition}
            currentGroup={currentGroup}
            columns={columns}
            tableData={tableData}
            getSubRows={getSubRows}
            showHeader={options.header}
            tableRef={tableRef}
            tableHeaderRef={tableHeaderRef}
            topOffset={tableTopOffset}
            alwaysVisibleFilter={options.alwaysVisibleFilter}
            isFocused={isFocused}
            autoScroll={options.autoScroll}
            shouldScroll={shouldScroll}
            onAfterScroll={onAfterScroll}
            collapsedByDefault={options.collapsedByDefault}
            eventBus={panelEventBus}
          />
        </Drawer>
      )}
    </ClickOutsideWrapper>
  );
};

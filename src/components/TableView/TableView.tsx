import { css, cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { Alert, ClickOutsideWrapper, Tab, TabsBar, useTheme2 } from '@grafana/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { TEST_IDS } from '../../constants';
import { useContentPosition, useContentSizes, useLocalStorage, useScrollTo, useTable } from '../../hooks';
import { PanelOptions } from '../../types';
import { Table } from '../Table';
import { getStyles } from './TableView.styles';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Table View
 */
export const TableView: React.FC<Props> = ({ data, id, options, width, height, eventBus }) => {
  /**
   * useLocalStorage Hook
   */
  const { get: getValue, update: saveValue, remove: removeValue } = useLocalStorage(`volkovlabs.variable.panel.${id}`);

  /**
   * Current Preselected Group
   */
  const currentPreselectedGroup = useMemo(() => {
    if (options.saveSelectedGroup) {
      const selectedGroup = getValue();
      return options.groups?.find((group) => group.name === selectedGroup)?.name || options.groups?.[0]?.name;
    }

    return options.groups?.[0]?.name;
  }, [getValue, options.groups, options.saveSelectedGroup]);

  /**
   * Current Levels Group
   */
  const [currentGroup, setCurrentGroup] = useState(currentPreselectedGroup);

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
      removeValue();
      setCurrentGroup(options.groups?.[0]?.name);
    }
  }, [currentGroup, id, options.groups, removeValue]);

  /**
   * Table config
   */
  const { tableData, columns, getSubRows } = useTable({ data, options, eventBus, levels: currentLevels });

  /**
   * Sticky position
   */
  const { containerRef, style } = useContentPosition({
    width,
    height,
    sticky: options.sticky,
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
    tableContentTopOffset,
  } = useContentSizes({ height, options, tableData });

  /**
   * First selected row ref
   */
  const firstSelectedRowRef = useRef(null);

  /**
   * Scroll To Element
   */
  const scrollTo = useScrollTo({ containerRef: scrollableContainerRef });

  /**
   * Is Panel Focused
   */
  const isFocused = useRef<boolean>(false);

  /**
   * Auto scroll on group updates
   */
  useEffect(() => {
    if (containerRef.current && firstSelectedRowRef.current && options.autoScroll) {
      scrollTo(firstSelectedRowRef.current, tableContentTopOffset);
    }
  }, [scrollTo, containerRef, currentGroup, firstSelectedRowRef, options.autoScroll, tableContentTopOffset]);

  /**
   * Auto scroll on external table data updates
   */
  useEffect(() => {
    if (containerRef.current && firstSelectedRowRef.current && options.autoScroll && tableData && !isFocused.current) {
      scrollTo(firstSelectedRowRef.current, tableContentTopOffset);
    }
  }, [scrollTo, containerRef, firstSelectedRowRef, options.autoScroll, tableData, tableContentTopOffset]);

  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

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
          {options.groups?.length > 1 && (
            <div ref={headerRef} className={styles.header}>
              <TabsBar>
                {options.groups?.map((group) => (
                  <Tab
                    key={group.name}
                    label={group.name}
                    onChangeTab={() => {
                      setCurrentGroup(group.name);
                      saveValue(group.name);
                    }}
                    active={currentGroup === group.name}
                    data-testid={TEST_IDS.tableView.tab(group.name)}
                  />
                ))}
              </TabsBar>
            </div>
          )}
          <Table
            key={currentGroup}
            columns={columns}
            data={tableData}
            getSubRows={getSubRows}
            showHeader={options.header}
            firstSelectedRowRef={firstSelectedRowRef}
            tableRef={tableRef}
            tableHeaderRef={tableHeaderRef}
            topOffset={tableTopOffset}
            scrollableContainerRef={scrollableContainerRef}
            alwaysVisibleFilter={options.alwaysVisibleFilter}
          />
        </div>
      </div>
    </ClickOutsideWrapper>
  );
};

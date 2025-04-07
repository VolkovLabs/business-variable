import { EventBus } from '@grafana/data';
import { ColumnDef, TableOptions } from '@tanstack/react-table';
import React, { RefObject, useLayoutEffect, useRef, useState } from 'react';

import { TEST_IDS } from '../../../../constants';
import { TableItem } from '../../../../types';
import { Table } from '../../../Table';

/**
 * Properties
 */
interface Props<TTableData extends TableItem> {
  /**
   * Current group
   *
   * @type {string}
   */
  currentGroup: string;

  /**
   * Table's columns definition. Must be memoized.
   */
  columns: Array<ColumnDef<TTableData>>;

  /**
   * The data to display in the table. Must be memoized.
   */
  tableData: TTableData[];

  /**
   * Class Name
   *
   * @type {string}
   */
  className?: string;

  /**
   * Get Sub Rows
   */
  getSubRows?: TableOptions<TTableData>['getSubRows'];

  /**
   * Show Header Cells
   *
   * @type {boolean}
   */
  showHeader?: boolean;

  /**
   * Table Ref
   */
  tableRef?: RefObject<HTMLTableElement>;

  /**
   * Table Header Ref
   */
  tableHeaderRef: RefObject<HTMLTableSectionElement>;

  /**
   * Top Offset
   *
   * @type {number}
   */
  topOffset?: number;

  /**
   * Always Visible Filter
   *
   * @type {boolean}
   */
  alwaysVisibleFilter: boolean;

  /**
   * Is Panel Focused
   */
  isFocused: RefObject<boolean>;

  /**
   * Should scroll
   */
  shouldScroll: RefObject<boolean>;

  /**
   * Auto scroll option
   *
   * @type {boolean}
   */
  autoScroll: boolean;

  /**
   * Function to call after auto scroll
   */
  onAfterScroll: () => void;

  /**
   * Collapsed by default
   *
   * @type {boolean}
   */
  collapsedByDefault: boolean;

  /**
   * Top Offset
   *
   * @type {number}
   */
  tableTopOffset?: number;

  /**
   * Panel Event Bus
   */
  eventBus: EventBus;
}

/**
 * Button View
 */
export const DrawerTable = <TTableData extends TableItem>({
  currentGroup,
  columns,
  tableData,
  getSubRows,
  showHeader,
  tableRef,
  tableHeaderRef,
  tableTopOffset,
  alwaysVisibleFilter,
  isFocused,
  autoScroll,
  shouldScroll,
  onAfterScroll,
  collapsedByDefault,
  eventBus,
  ...restProps
}: Props<TTableData>) => {
  /**
   * Element ref`s
   */
  const drawerContainer = useRef<HTMLDivElement>(null);
  const scrollDrawerContainer = useRef<HTMLDivElement>(null);

  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    if (drawerContainer.current && scrollDrawerContainer.current) {
      setIsReady(true);
    }
  }, []);

  return (
    <div ref={drawerContainer} data-testid={TEST_IDS.drawerTable.root}>
      <div ref={scrollDrawerContainer}>
        {isReady && (
          <Table
            key={currentGroup}
            columns={columns}
            data={tableData}
            getSubRows={getSubRows}
            showHeader={showHeader}
            tableRef={tableRef}
            tableHeaderRef={tableHeaderRef}
            topOffset={tableTopOffset}
            scrollableContainerRef={scrollDrawerContainer}
            alwaysVisibleFilter={alwaysVisibleFilter}
            isFocused={isFocused}
            autoScroll={autoScroll}
            shouldScroll={shouldScroll}
            onAfterScroll={onAfterScroll}
            collapsedByDefault={collapsedByDefault}
            eventBus={eventBus}
            {...restProps}
          />
        )}
      </div>
    </div>
  );
};

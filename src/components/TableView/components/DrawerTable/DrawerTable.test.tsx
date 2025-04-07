import { getDataSourceSrv, getTemplateSrv } from '@grafana/runtime';
import { ColumnDef } from '@tanstack/react-table';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../../../constants';
import { TableItem } from '../../../../types';
import { DrawerTable } from './DrawerTable';

/**
 * Props
 */
type Props = React.ComponentProps<typeof DrawerTable>;

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  getDataSourceSrv: jest.fn(),
  getTemplateSrv: jest.fn(),
}));

/**
 * Mock table
 */
jest.mock('../../../Table', () => ({
  Table: jest.fn(() => <div data-testid="data-testid table-mock-element">Table</div>),
}));

describe('DrawerTable', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({
    ...TEST_IDS.drawerTable,
    tableMock: 'data-testid table-mock-element',
  });
  const selectors = getSelectors(screen);

  const columns: Array<ColumnDef<TableItem>> = [];
  const tableData: TableItem[] = [];

  const defaultProps = {
    currentGroup: 'group-1',
    columns,
    tableData,
    tableHeaderRef: { current: null },
    alwaysVisibleFilter: true,
    isFocused: { current: false },
    autoScroll: false,
    shouldScroll: { current: false },
    onAfterScroll: jest.fn(),
    collapsedByDefault: false,
    eventBus: jest.fn(),
  } as any;
  /**
   * Get component
   */
  const getComponent = (props: Partial<Props>) => {
    return <DrawerTable {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(getDataSourceSrv).mockReset();
    jest.mocked(getTemplateSrv).mockReturnValue({
      replace: jest.fn((str) => str),
    } as never);
  });

  it('Should renders without crashing', () => {
    render(getComponent(defaultProps));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.tableMock()).toBeInTheDocument();
  });
});

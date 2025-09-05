import { act, fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../../../constants';

import { TableMinimizeView } from './TableMinimizeView';
import { VariableType } from '../../../../types';

/**
 * Properties
 */
type Props = React.ComponentProps<typeof TableMinimizeView>;

/**
 * In Test Ids
 */
const InTestIds = {
  optionsVariable: 'data-testid drawer-mock-table-view',
};

/**
 * Mock OptionsVariable
 */
jest.mock('components/OptionsVariable', () => ({
  OptionsVariable: jest.fn(() => <div data-testid={InTestIds.optionsVariable}>Options Variable</div>),
}));

/**
 * Table Minimize View
 */
describe('Table Minimize View', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.tableMinimizeView, ...InTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = ({ options = {} as any, ...restProps }: Partial<Props>) => {
    return <TableMinimizeView options={options} {...(restProps as any)} />;
  };

  it('Should Render open Drawer button and open drawer for query variable', async () => {
    const setIsDrawerOpen = jest.fn();
    await act(async () =>
      render(
        getComponent({
          runtimeVariable: { type: VariableType.QUERY } as any,
          setIsDrawerOpen: setIsDrawerOpen,
          options: { isMinimizeViewShowCustomIcon: false } as any,
        })
      )
    );

    expect(selectors.buttonOpenDrawer()).toBeInTheDocument();
    expect(selectors.optionsVariable()).toBeInTheDocument();

    fireEvent.click(selectors.buttonOpenDrawer());

    expect(setIsDrawerOpen).toHaveBeenCalled();
  });

  it('Should Render open Drawer button and open drawer for CUSTOM variable', async () => {
    const setIsDrawerOpen = jest.fn();
    await act(async () =>
      render(
        getComponent({
          runtimeVariable: { type: VariableType.CUSTOM } as any,
          setIsDrawerOpen: setIsDrawerOpen,
          options: { isMinimizeViewShowCustomIcon: false } as any,
        })
      )
    );

    expect(selectors.buttonOpenDrawer()).toBeInTheDocument();
    expect(selectors.optionsVariable()).toBeInTheDocument();

    fireEvent.click(selectors.buttonOpenDrawer());

    expect(setIsDrawerOpen).toHaveBeenCalled();
  });

  it('Should Render open Drawer button and open drawer for query variable with custom icon', async () => {
    const setIsDrawerOpen = jest.fn();
    await act(async () =>
      render(
        getComponent({
          runtimeVariable: { type: VariableType.QUERY } as any,
          setIsDrawerOpen: setIsDrawerOpen,
          options: { isMinimizeViewShowCustomIcon: true, minimizeViewCustomIcon: '/test' } as any,
        })
      )
    );

    expect(selectors.buttonOpenDrawerCustomIcon()).toBeInTheDocument();
    expect(selectors.optionsVariable()).toBeInTheDocument();

    fireEvent.click(selectors.buttonOpenDrawerCustomIcon());

    expect(setIsDrawerOpen).toHaveBeenCalled();
  });

  it('Should Render open Drawer button and open drawer for CUSTOM variable with custom icon', async () => {
    const setIsDrawerOpen = jest.fn();
    await act(async () =>
      render(
        getComponent({
          runtimeVariable: { type: VariableType.CUSTOM } as any,
          setIsDrawerOpen: setIsDrawerOpen,
          options: { isMinimizeViewShowCustomIcon: true, minimizeViewCustomIcon: '/test' } as any,
        })
      )
    );

    expect(selectors.buttonOpenDrawerCustomIcon()).toBeInTheDocument();
    expect(selectors.optionsVariable()).toBeInTheDocument();

    fireEvent.click(selectors.buttonOpenDrawerCustomIcon());

    expect(setIsDrawerOpen).toHaveBeenCalled();
  });
});

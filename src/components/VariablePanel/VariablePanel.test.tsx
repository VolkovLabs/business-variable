import { render, screen } from '@testing-library/react';
import React from 'react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import { DisplayMode } from '../../types';
import { VariablePanel } from './VariablePanel';

/**
 * Properties
 */
type Props = React.ComponentProps<typeof VariablePanel>;

/**
 * In Test Ids
 */
const InTestIds = {
  tableView: 'data-testid table-view',
  minimizeView: 'data-testid minimize-view',
  buttonView: 'data-testid button-view',
};

/**
 * Mock TableView
 */
jest.mock('../TableView', () => ({
  TableView: jest.fn(() => <div data-testid={InTestIds.tableView} />),
}));

/**
 * Mock MinimizeView
 */
jest.mock('../MinimizeView', () => ({
  MinimizeView: jest.fn(() => <div data-testid={InTestIds.minimizeView} />),
}));

/**
 * Mock ButtonView
 */
jest.mock('../ButtonView', () => ({
  ButtonView: jest.fn(() => <div data-testid={InTestIds.buttonView} />),
}));

/**
 * Panel
 */
describe('Panel', () => {
  /**
   * Get Tested Component
   */
  const getComponent = ({ options = {} as any, ...restProps }: Partial<Props>) => {
    return <VariablePanel options={options} {...(restProps as any)} />;
  };

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(InTestIds);
  const selectors = getSelectors(screen);

  it('Should render table view', async () => {
    render(getComponent({ options: { displayMode: DisplayMode.TABLE } as any }));
    expect(selectors.tableView()).toBeInTheDocument();
  });

  it('Should render minimize view', async () => {
    render(getComponent({ options: { displayMode: DisplayMode.MINIMIZE } as any }));
    expect(selectors.minimizeView()).toBeInTheDocument();
  });

  it('Should render button view', async () => {
    render(getComponent({ options: { displayMode: DisplayMode.BUTTON } as any }));
    expect(selectors.buttonView()).toBeInTheDocument();
  });

  it('Should render table view by default', async () => {
    render(getComponent({ options: { displayMode: undefined } as any }));
    expect(selectors.tableView()).toBeInTheDocument();
  });
});

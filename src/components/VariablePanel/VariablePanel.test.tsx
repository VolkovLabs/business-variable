import { render, screen } from '@testing-library/react';
import React from 'react';
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
  tableView: 'table-view',
  minimizeView: 'minimize-view',
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
 * Panel
 */
describe('Panel', () => {
  /**
   * Get Tested Component
   */
  const getComponent = ({ options = {} as any, ...restProps }: Partial<Props>) => {
    return <VariablePanel options={options} {...(restProps as any)} />;
  };

  it('Should render table view', async () => {
    render(getComponent({ options: { displayMode: DisplayMode.TABLE } as any }));
    expect(screen.getByTestId(InTestIds.tableView)).toBeInTheDocument();
  });

  it('Should render minimize view', async () => {
    render(getComponent({ options: { displayMode: DisplayMode.MINIMIZE } as any }));
    expect(screen.getByTestId(InTestIds.minimizeView)).toBeInTheDocument();
  });

  it('Should render table view by default', async () => {
    render(getComponent({ options: { displayMode: undefined } as any }));
    expect(screen.getByTestId(InTestIds.tableView)).toBeInTheDocument();
  });
});

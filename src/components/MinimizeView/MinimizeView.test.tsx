import React from 'react';
import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import { TestIds } from '../../constants';
import { useRuntimeVariables } from '../../hooks';
import { VariableType } from '../../types';
import { MinimizeView } from './MinimizeView';

/**
 * In Test Ids
 */
const InTestIds = {
  optionsVariable: 'data-testid options-variable',
};

/**
 * Mock Options Variable
 */
jest.mock('../OptionsVariable', () => ({
  OptionsVariable: jest.fn(() => <div data-testid={InTestIds.optionsVariable} />),
}));

/**
 * Mock hooks
 */
jest.mock('../../hooks', () => ({
  useRuntimeVariables: jest.fn(() => ({
    variable: null,
  })),
}));

/**
 * Properties
 */
type Props = React.ComponentProps<typeof MinimizeView>;

/**
 * Minimize View
 */
describe('Minimize View', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TestIds.minimizeView, ...InTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = ({ options, ...restProps }: Partial<Props>) => {
    return <MinimizeView options={options} {...(restProps as any)} />;
  };

  it('Should show no variable message', () => {
    render(getComponent({}));

    expect(selectors.noVariableMessage()).toBeInTheDocument();
  });

  it('Should show variable control for query type', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: {
            label: '123',
            type: VariableType.QUERY,
          },
        } as any)
    );
    render(getComponent({}));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.optionsVariable()).toBeInTheDocument();
  });

  it('Should show variable control for custom type', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: {
            label: '123',
            type: VariableType.CUSTOM,
          },
        } as any)
    );
    render(getComponent({}));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.optionsVariable()).toBeInTheDocument();
  });
});

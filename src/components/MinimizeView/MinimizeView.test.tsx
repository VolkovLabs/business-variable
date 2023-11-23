import { render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { useRuntimeVariables } from '../../hooks';
import { VariableType } from '../../types';
import { MinimizeView } from './MinimizeView';

/**
 * In Test Ids
 */
const InTestIds = {
  optionsVariable: 'data-testid options-variable',
  textVariable: 'data-testid text-variable',
};

/**
 * Mock Options Variable
 */
jest.mock('../OptionsVariable', () => ({
  OptionsVariable: jest.fn(() => <div data-testid={InTestIds.optionsVariable} />),
}));

/**
 * Mock Text Variable
 */
jest.mock('../TextVariable', () => ({
  TextVariable: jest.fn(() => <div data-testid={InTestIds.textVariable} />),
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
  const getSelectors = getJestSelectors({ ...TEST_IDS.minimizeView, ...InTestIds });
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = ({ options, ...restProps }: Partial<Props>) => {
    return <MinimizeView options={options} {...(restProps as any)} width={400} />;
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
        }) as any
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
        }) as any
    );
    render(getComponent({}));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.optionsVariable()).toBeInTheDocument();
  });

  it('Should show variable control for text box type', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: {
            label: '123',
            type: VariableType.TEXTBOX,
          },
        }) as any
    );
    render(getComponent({}));

    expect(selectors.root()).toBeInTheDocument();
    expect(selectors.textVariable()).toBeInTheDocument();
  });

  it('Should show variable label', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: {
            label: '123',
            type: VariableType.TEXTBOX,
          },
        }) as any
    );

    render(getComponent({}));

    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('Should show variable name', () => {
    jest.mocked(useRuntimeVariables).mockImplementation(
      () =>
        ({
          variable: {
            name: '123',
            type: VariableType.TEXTBOX,
          },
        }) as any
    );

    render(getComponent({}));

    expect(screen.getByText('123')).toBeInTheDocument();
  });
});

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import { TestIds } from '../../constants';
import { selectVariableValues } from '../../utils';
import { TextVariable } from './TextVariable';

/**
 * Mock utils
 */
jest.mock('../../utils', () => ({
  selectVariableValues: jest.fn(),
}));

/**
 * Properties
 */
type Props = React.ComponentProps<typeof TextVariable>;

/**
 * Text Variable
 */
describe('Text Variable', () => {
  const defaultVariable = {
    label: 'Name',
    current: {
      value: '123',
    },
  };

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TestIds.textVariable);
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <TextVariable variable={defaultVariable} {...(props as any)} />;
  };

  it('Should apply initial variable value', () => {
    render(
      getComponent({
        variable: defaultVariable as any,
      })
    );

    expect(selectors.root()).toHaveValue(defaultVariable.current.value);
  });

  it('Should show variable label', () => {
    render(
      getComponent({
        variable: defaultVariable as any,
      })
    );

    expect(screen.getByText(defaultVariable.label)).toBeInTheDocument();
  });

  it('Should show variable name', () => {
    render(
      getComponent({
        variable: {
          ...defaultVariable,
          label: '',
          name: 'name',
        } as any,
      })
    );

    expect(screen.getByText('name')).toBeInTheDocument();
  });

  it('Should apply empty string if variable value is undefined', () => {
    render(
      getComponent({
        variable: {
          ...defaultVariable,
          current: {},
        } as any,
      })
    );

    expect(selectors.root()).toHaveValue('');
  });

  it('Should apply updated variable value', () => {
    const { rerender } = render(
      getComponent({
        variable: defaultVariable as any,
      })
    );

    expect(selectors.root()).toHaveValue(defaultVariable.current.value);

    rerender(
      getComponent({
        variable: {
          ...defaultVariable,
          current: {
            value: 'hello',
          },
        } as any,
      })
    );

    expect(selectors.root()).toHaveValue('hello');
  });

  it('Should update variable value', () => {
    render(
      getComponent({
        variable: defaultVariable as any,
      })
    );

    fireEvent.change(selectors.root(), { target: { value: 'hello' } });

    fireEvent.blur(selectors.root());

    expect(selectVariableValues).toHaveBeenCalledWith(['hello'], defaultVariable);
  });
});

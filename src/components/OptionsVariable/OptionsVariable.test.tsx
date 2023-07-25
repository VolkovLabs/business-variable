import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import { TestIds } from '../../constants';
import { OptionsVariable } from './OptionsVariable';
import { selectVariableValues } from '../../utils';

/**
 * Mock utils
 */
jest.mock('../../utils', () => ({
  selectVariableValues: jest.fn(),
}));

/**
 * Properties
 */
type Props = React.ComponentProps<typeof OptionsVariable>;

/**
 * Options Variable
 */
describe('Options Variable', () => {
  const defaultVariable = {
    options: [],
  };

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TestIds.optionsVariable);
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <OptionsVariable variable={defaultVariable} width={300} {...(props as any)} />;
  };

  describe('Single variable', () => {
    const option1 = {
      text: 'Option 1',
      value: 'option1',
      selected: false,
    };
    const option2 = {
      text: 'Option 2',
      value: 'option2',
      selected: false,
    };
    const singleVariable = {
      multi: false,
      options: [option1, option2],
    };

    it('Should render component', () => {
      render(getComponent({ variable: singleVariable as any }));

      expect(selectors.root()).toBeInTheDocument();
    });

    it('Should apply selected value', () => {
      render(
        getComponent({
          variable: {
            ...singleVariable,
            options: [
              {
                ...option1,
                selected: true,
              },
              option2,
            ],
          } as any,
        })
      );

      expect(selectors.root()).toHaveValue(option1.value);
    });

    it('Should select value', () => {
      render(
        getComponent({
          variable: {
            ...singleVariable,
            options: [
              {
                ...option1,
                selected: true,
              },
              option2,
            ],
          } as any,
        })
      );

      fireEvent.change(selectors.root(), { target: { value: option2.value } });

      expect(selectVariableValues).toHaveBeenCalledWith([option2.value], expect.any(Object));
    });
  });

  describe('Multi variable', () => {
    const allOption = {
      text: 'All',
      value: '$__all',
      selected: false,
    };
    const option1 = {
      text: 'Option 1',
      value: 'option1',
      selected: false,
    };
    const option2 = {
      text: 'Option 2',
      value: 'option2',
      selected: false,
    };
    const multiVariable = {
      multi: true,
      includeAll: true,
      options: [allOption, option1, option2],
    };

    it('Should render component', () => {
      render(getComponent({ variable: multiVariable as any }));

      expect(selectors.root()).toBeInTheDocument();
    });

    it('Should apply selected value', () => {
      render(
        getComponent({
          variable: {
            ...multiVariable,
            options: [
              {
                ...option1,
                selected: true,
              },
              option2,
            ],
          } as any,
        })
      );

      expect(selectors.root()).toHaveValue([option1.value]);
    });

    it('Should select value', () => {
      render(
        getComponent({
          variable: {
            ...multiVariable,
            options: [
              {
                ...option1,
                selected: true,
              },
              option2,
            ],
          } as any,
        })
      );

      fireEvent.change(selectors.root(), { target: { values: [option2.value] } });

      expect(selectVariableValues).toHaveBeenCalledWith([option2.value], expect.any(Object));
    });

    it('Should deselect all value if was selected before', () => {
      render(
        getComponent({
          variable: {
            ...multiVariable,
            options: [
              {
                ...allOption,
                selected: true,
              },
              option1,
              option2,
            ],
          } as any,
        })
      );

      fireEvent.change(selectors.root(), { target: { values: ['All', option1.value] } });

      expect(selectVariableValues).toHaveBeenCalledWith([option1.value], expect.any(Object));
    });

    it('Should select only all value while all selection', () => {
      render(
        getComponent({
          variable: {
            ...multiVariable,
            options: [
              allOption,
              {
                ...option1,
                selected: true,
              },
              option2,
            ],
          } as any,
        })
      );

      fireEvent.change(selectors.root(), { target: { values: ['All', option2.value] } });

      expect(selectVariableValues).toHaveBeenCalledWith(['All'], expect.any(Object));
    });

    it('Should select all value if no selected values', () => {
      render(
        getComponent({
          variable: {
            ...multiVariable,
            options: [
              allOption,
              {
                ...option1,
                selected: true,
              },
              option2,
            ],
          } as any,
        })
      );

      fireEvent.change(selectors.root(), { target: { values: [] } });

      expect(selectVariableValues).toHaveBeenCalledWith(['All'], expect.any(Object));
    });

    it('Should deselect values', () => {
      render(
        getComponent({
          variable: {
            ...multiVariable,
            options: [
              allOption,
              {
                ...option1,
                selected: true,
              },
              {
                ...option2,
                selected: true,
              },
            ],
          } as any,
        })
      );

      fireEvent.change(selectors.root(), { target: { values: [option1.value] } });

      expect(selectVariableValues).toHaveBeenCalledWith([option2.value], expect.any(Object));
    });
  });
});

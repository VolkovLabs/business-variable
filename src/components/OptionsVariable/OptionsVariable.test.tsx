import { fireEvent, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { ALL_VALUE, ALL_VALUE_PARAMETER, NO_VALUE_PARAMETER, TEST_IDS } from '../../constants';
import { selectVariableValues } from '../../utils';
import { OptionsVariable } from './OptionsVariable';

/**
 * Mock utils/variable
 */
jest.mock('../../utils/variable', () => ({
  selectVariableValues: jest.fn(),
}));

/**
 * Persistent Storage Mock
 */
const persistentStorageMock = {
  remove: jest.fn(),
};

/**
 * Mock hooks
 */
jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  usePersistentStorage: jest.fn(() => persistentStorageMock),
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
  const getSelectors = getJestSelectors(TEST_IDS.optionsVariable);
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = (props: Partial<Props>) => {
    return <OptionsVariable variable={defaultVariable} width={300} {...(props as any)} />;
  };

  beforeEach(() => {
    jest.mocked(selectVariableValues).mockClear();
  });

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

    it('Should remove persistent values on selection', () => {
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
          persistent: true,
        })
      );

      fireEvent.change(selectors.root(), { target: { value: option2.value } });

      expect(persistentStorageMock.remove).toHaveBeenCalled();
    });
  });

  describe('Multi variable', () => {
    const allOption = {
      text: ALL_VALUE,
      value: ALL_VALUE_PARAMETER,
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

      fireEvent.change(selectors.root(), { target: { values: [ALL_VALUE_PARAMETER, option1.value] } });

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

      fireEvent.change(selectors.root(), { target: { values: [ALL_VALUE_PARAMETER, option2.value] } });

      expect(selectVariableValues).toHaveBeenCalledWith([ALL_VALUE_PARAMETER], expect.any(Object));
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

      expect(selectVariableValues).toHaveBeenCalledWith([ALL_VALUE_PARAMETER], expect.any(Object));
    });

    it('Should clear value if no selected values and emptyValue enabled', () => {
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
          emptyValue: true,
        })
      );

      fireEvent.change(selectors.root(), { target: { values: [] } });

      expect(selectVariableValues).toHaveBeenCalledWith([NO_VALUE_PARAMETER], expect.any(Object));
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

  describe('OptionsVariable', () => {
    const allOption = {
      text: ALL_VALUE,
      value: ALL_VALUE_PARAMETER,
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
    const arrayCustomOptions = ['Option 2', 'Option 4'];
    const currentOptions = {
      text: 'Option 5',
    };

    it('Should render component', () => {
      render(
        getComponent({
          variable: {
            ...multiVariable,
            ...currentOptions,
            current: {
              ...currentOptions,
            },
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

      expect(selectors.root()).toBeInTheDocument();
    });

    it('should push array custom value to selectedValues', () => {
      render(
        getComponent({
          variable: {
            ...multiVariable,
            current: {
              text: arrayCustomOptions,
            },
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
      expect(selectVariableValues).toHaveBeenCalledWith([option2.value, ...arrayCustomOptions], expect.any(Object));
    });

    it('should push string custom value to selectedValues', () => {
      render(
        getComponent({
          variable: {
            ...multiVariable,
            current: {
              ...currentOptions,
            },
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
      expect(selectVariableValues).toHaveBeenCalledWith([option2.value, currentOptions.text], expect.any(Object));
    });
  });
});

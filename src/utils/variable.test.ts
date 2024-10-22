import { locationService } from '@grafana/runtime';

import { ALL_VALUE, ALL_VALUE_PARAMETER, NO_VALUE_PARAMETER } from '../constants';
import { VariableChangedEvent, VariableType } from '../types';
import { getRuntimeVariable, selectVariableValues } from './variable';

/**
 * Mock @grafana/scenes
 */
jest.mock('@grafana/scenes', () => ({
  sceneGraph: {
    getVariables: jest.fn(),
  },
  sceneUtils: {
    isQueryVariable: jest.fn((value) => {
      return value.state.type === VariableType.QUERY;
    }),
    isCustomVariable: jest.fn((value) => {
      return value.state.type === VariableType.CUSTOM;
    }),
    isDataSourceVariable: jest.fn((value) => {
      return value.state.type === VariableType.DATASOURCE;
    }),
    isTextBoxVariable: jest.fn((value) => {
      return value.state.type === VariableType.TEXTBOX;
    }),
    isConstantVariable: jest.fn((value) => {
      return value.state.type === VariableType.CONSTANT;
    }),
    isIntervalVariable: jest.fn((value) => {
      return value.state.type === VariableType.INTERVAL;
    }),
    isAdHocVariable: jest.fn((value) => {
      return value.state.type === VariableType.ADHOC;
    }),
  },
}));

/**
 * Mock @grafana/runtime
 */
jest.mock('@grafana/runtime', () => ({
  locationService: {
    getSearch: jest.fn(),
    getSearchObject: jest.fn(() => ({})),
    partial: jest.fn(),
  },
}));

describe('Variable Utils', () => {
  /**
   * Event Bus
   */
  const eventBus: any = {
    publish: jest.fn(),
  };

  beforeEach(() => {
    eventBus.publish.mockClear();
  });

  it('Should emit variable changed event', () => {
    const variable = { name: 'variable', type: VariableType.CUSTOM, options: [] };
    selectVariableValues({
      values: ['value1', 'value2'],
      runtimeVariable: variable as any,
      panelEventBus: eventBus,
    });

    expect(eventBus.publish).toHaveBeenCalledWith({
      type: VariableChangedEvent.type,
    });
  });

  describe('selectVariableValues', () => {
    beforeEach(() => {
      jest.mocked(locationService.partial).mockClear();
    });

    describe('Custom Single', () => {
      jest.mocked(locationService.getSearch).mockImplementation(
        () =>
          ({
            getAll: jest.fn(() => []),
          }) as any
      );

      it('Should apply only first value', () => {
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [] };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: 'value1',
          },
          true
        );
      });

      it('Should apply all value', () => {
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [] };
        selectVariableValues({
          values: [ALL_VALUE_PARAMETER],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ALL_VALUE,
          },
          true
        );
      });

      it('Should apply no value', () => {
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [] };
        selectVariableValues({
          values: [NO_VALUE_PARAMETER],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: '',
          },
          true
        );
      });
    });

    describe('Custom Multi', () => {
      jest.mocked(locationService.getSearch).mockImplementation(
        () =>
          ({
            getAll: jest.fn(() => []),
          }) as any
      );

      it('Should apply all values', () => {
        const variable = { name: 'variable', type: VariableType.CUSTOM, current: { value: [] }, multi: true };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2'],
          },
          true
        );
      });

      it('Should apply no value', () => {
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [], multi: true };
        selectVariableValues({
          values: [NO_VALUE_PARAMETER],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: '',
          },
          true
        );
      });

      it('Should add all values to already selected values', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['selected1', 'selected2']),
            }) as any
        );
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [], multi: true };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1', 'selected2'],
          },
          true
        );
      });

      it('Should remove "$__all" values from already selected', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => [ALL_VALUE_PARAMETER]),
            }) as any
        );
        const variable = {
          name: 'variable',
          type: VariableType.CUSTOM,
          current: { value: [ALL_VALUE_PARAMETER] },
          options: [],
          multi: true,
        };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2'],
          },
          true
        );
      });

      it('Should add all unique values to already selected values', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['value2', 'selected1', 'selected2']),
            }) as any
        );
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [], multi: true };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1', 'selected2'],
          },
          true
        );
      });

      it('Should set only all value if all was passed', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['value2', 'selected1', 'selected2']),
            }) as any
        );
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [], multi: true };
        selectVariableValues({
          values: ['value1', ALL_VALUE_PARAMETER],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ALL_VALUE,
          },
          true
        );

        /**
         * Check case-insensitive of all value
         */
        jest.mocked(locationService.partial).mockClear();
        selectVariableValues({
          values: ['value1', ALL_VALUE_PARAMETER],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ALL_VALUE,
          },
          true
        );
      });

      it('Should deselect values if all already selected', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['value1', 'value2', 'selected1', 'selected2']),
            }) as any
        );
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [], multi: true };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
          isKeepSelection: false,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['selected1', 'selected2'],
          },
          true
        );
      });

      it('Should select values if some already selected', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => ['value1', 'selected1', 'selected2']),
            }) as any
        );
        const variable = { name: 'variable', type: VariableType.CUSTOM, current: { value: [] }, multi: true };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1', 'selected2'],
          },
          true
        );
      });

      it('Should adjust values if they not defined in url ', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => []),
            }) as any
        );
        jest.mocked(locationService.getSearchObject).mockImplementation(() => ({}));
        const variable = {
          name: 'variable',
          type: VariableType.CUSTOM,
          current: {
            value: ['selected1'],
          },
          multi: true,
        };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1'],
          },
          true
        );
      });

      it('Should adjust values if they not defined in url for non array', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => []),
            }) as any
        );
        jest.mocked(locationService.getSearchObject).mockImplementation(() => ({}));
        const variable = {
          name: 'variable',
          type: VariableType.CUSTOM,
          current: {
            value: 'selected1',
          },
          multi: true,
        };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1'],
          },
          true
        );
      });

      it('Should deselect all value if it not defined in url ', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => []),
            }) as any
        );
        jest.mocked(locationService.getSearchObject).mockImplementation(() => ({}));
        const variable = {
          name: 'variable',
          type: VariableType.CUSTOM,
          current: {
            value: [ALL_VALUE_PARAMETER],
          },
          multi: true,
        };
        selectVariableValues({
          values: ['value1', 'value2'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2'],
          },
          true
        );
      });

      it('Should deselect value if All selected and keep selection enabled', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => []),
            }) as any
        );
        jest.mocked(locationService.getSearchObject).mockImplementation(() => ({}));
        const variable = {
          name: 'variable',
          type: VariableType.CUSTOM,
          current: {
            value: [ALL_VALUE_PARAMETER, 'value1', 'value2'],
          },
          options: [
            {
              text: 'All',
              value: '$__all',
              selected: true,
            },
            {
              text: 'value1',
              value: 'value1',
              selected: false,
            },
            {
              text: 'value2',
              value: 'value2',
              selected: false,
            },
          ],
          includeAll: true,
          multi: true,
        };
        selectVariableValues({
          values: ['value1'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
          isKeepSelection: true,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value2'],
          },
          true
        );
      });

      it('Should deselect value if All selected as string and keep selection enabled', () => {
        jest.mocked(locationService.getSearch).mockImplementation(
          () =>
            ({
              getAll: jest.fn(() => []),
            }) as any
        );
        jest.mocked(locationService.getSearchObject).mockImplementation(() => ({}));
        const variable = {
          name: 'variable',
          type: VariableType.CUSTOM,
          current: {
            value: ALL_VALUE_PARAMETER,
          },
          options: [
            {
              text: 'All',
              value: '$__all',
              selected: true,
            },
            {
              text: 'value1',
              value: 'value1',
              selected: false,
            },
            {
              text: 'value2',
              value: 'value2',
              selected: false,
            },
          ],
          includeAll: true,
          multi: true,
        };
        selectVariableValues({
          values: ['value1'],
          runtimeVariable: variable as any,
          panelEventBus: eventBus,
          isKeepSelection: true,
        });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value2'],
          },
          true
        );
      });
    });

    describe('Text Box', () => {
      it('Should apply only first value', () => {
        const variable = { name: 'variable', type: VariableType.TEXTBOX };
        selectVariableValues({ values: ['value1'], runtimeVariable: variable as any, panelEventBus: eventBus });

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: 'value1',
          },
          true
        );
      });
    });

    it('Should not apply value if no variable passed', () => {
      selectVariableValues({ values: ['value1'], panelEventBus: eventBus });

      expect(locationService.partial).not.toHaveBeenCalled();
    });

    it('Should not apply value for unsupported variable type', () => {
      const variable = { name: 'variable', type: VariableType.ADHOC };
      selectVariableValues({ values: ['value1'], runtimeVariable: variable as any, panelEventBus: eventBus });

      expect(locationService.partial).not.toHaveBeenCalled();
    });
  });

  describe('getRuntimeVariable', () => {
    it('Should return variable with "All" option if option not return in options list', () => {
      const variable = {
        name: 'variable',
        type: VariableType.CUSTOM,
        current: {
          value: ALL_VALUE_PARAMETER,
        },
        options: [
          {
            text: 'value1',
            value: 'value1',
            selected: false,
          },
          {
            text: 'value2',
            value: 'value2',
            selected: false,
          },
        ],
        includeAll: true,
        multi: true,
      } as any;
      const result = getRuntimeVariable(variable);

      expect(result?.options[0].value).toEqual(ALL_VALUE_PARAMETER);
      expect(result?.options[0].selected).toBeTruthy();
    });

    it('Should return variable with "All" option if option not return in options list and not select if not present in current value', () => {
      const variable = {
        name: 'variable',
        type: VariableType.CUSTOM,
        current: {
          value: [],
        },
        options: [
          {
            text: 'value1',
            value: 'value1',
            selected: false,
          },
          {
            text: 'value2',
            value: 'value2',
            selected: false,
          },
        ],
        includeAll: true,
        multi: true,
      } as any;
      const result = getRuntimeVariable(variable);

      expect(result?.options[0].value).toEqual(ALL_VALUE_PARAMETER);
      expect(result?.options[0].selected).not.toBeTruthy();
    });
  });
});

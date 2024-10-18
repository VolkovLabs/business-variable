import { VariableHide, VariableRefresh } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { sceneUtils } from '@grafana/scenes';

import { ALL_VALUE, ALL_VALUE_PARAMETER, NO_VALUE_PARAMETER } from '../constants';
import { VariableChangedEvent, VariableType } from '../types';
import {
  convertCurrentProperty,
  convertToAdhocVariable,
  convertToConstantVariable,
  convertToCustomVariable,
  convertToDataSourceVariable,
  convertToIntervalVariable,
  convertToQueryVariable,
  convertToTextBoxVariable,
  getIntervalsQueryFromNewIntervalModel,
  getRuntimeVariable,
  getVariablesCompatibility,
  sceneStateToVariableOptions,
  selectVariableValues,
} from './variable';

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

  describe('Convert variables', () => {
    const commonProperties = {
      id: 'testId',
      name: 'testName',
    } as any;

    const sceneVariable = {
      state: {
        value: 1,
        text: 'Option 1',
        refresh: VariableRefresh.never,
        query: 'some-query',
        definition: 'some-definition',
        datasource: 'datasource1',
        sort: 0,
        regex: false,
        allValue: 'all',
        includeAll: true,
        isMulti: false,
        options: [],
      },
    } as any;

    describe('getIntervalsQueryFromNewIntervalModel', () => {
      it('Should return a comma-separated string from an array of strings', () => {
        const input = ['interval1', 'interval2', 'interval3'];
        const output = getIntervalsQueryFromNewIntervalModel(input);
        expect(output).toBe('interval1,interval2,interval3');
      });

      it('Should return an empty string for an empty array', () => {
        const input: string[] = [];
        const output = getIntervalsQueryFromNewIntervalModel(input);
        expect(output).toBe('');
      });

      it('Should return an empty string when input is not an array', () => {
        const output = getIntervalsQueryFromNewIntervalModel('notAnArray' as unknown as string[]);
        expect(output).toBe('');
      });

      it('Should return an empty string when input is undefined', () => {
        const output = getIntervalsQueryFromNewIntervalModel(undefined as unknown as string[]);
        expect(output).toBe('');
      });

      it('Should return an empty string when input is null', () => {
        const output = getIntervalsQueryFromNewIntervalModel(null as unknown as string[]);
        expect(output).toBe('');
      });
    });

    describe('sceneStateToVariableOptions', () => {
      it('Should correctly map options with single selected value', () => {
        const varState = {
          options: [
            { value: 1, label: 'Option 1' },
            { value: 2, label: 'Option 2' },
          ],
          value: 1,
        } as any;
        const result = sceneStateToVariableOptions(varState);

        expect(result).toEqual([
          { value: '1', text: 'Option 1', selected: true },
          { value: '2', text: 'Option 2', selected: false },
        ]);
      });

      it('Should correctly map options with multiple selected values', () => {
        const varState = {
          options: [
            { value: 1, label: 'Option 1' },
            { value: 2, label: 'Option 2' },
            { value: 3, label: 'Option 3' },
          ],
          value: [1, 3],
        } as any;
        const result = sceneStateToVariableOptions(varState);

        expect(result).toEqual([
          { value: '1', text: 'Option 1', selected: true },
          { value: '2', text: 'Option 2', selected: false },
          { value: '3', text: 'Option 3', selected: true },
        ]);
      });
    });

    describe('convertCurrentProperty', () => {
      it('Should convert single value to string', () => {
        const option = 42;
        const result = convertCurrentProperty(option);
        expect(result).toBe('42');
      });

      it('Should convert an array of numbers to array of strings', () => {
        const option = [1, 2, 3];
        const result = convertCurrentProperty(option);
        expect(result).toEqual(['1', '2', '3']);
      });

      it('Should convert an array of strings to array of strings', () => {
        const option = ['a', 'b', 'c'];
        const result = convertCurrentProperty(option);
        expect(result).toEqual(['a', 'b', 'c']);
      });
    });

    describe('convertToQueryVariable', () => {
      it('Should return correct QueryCoreVariableModel for never refresh', () => {
        const result = convertToQueryVariable(commonProperties, sceneVariable);

        expect(result).toEqual({
          ...commonProperties,
          current: { value: sceneVariable.state.value, text: sceneVariable.state.text },
          type: VariableType.QUERY,
          options: [],
          query: sceneVariable.state.query,
          definition: sceneVariable.state.definition,
          datasource: sceneVariable.state.datasource,
          sort: sceneVariable.state.sort,
          refresh: sceneVariable.state.refresh,
          regex: sceneVariable.state.regex,
          allValue: sceneVariable.state.allValue,
          includeAll: true,
          multi: false,
          skipUrlSync: false,
        });
      });

      it('Should return correct QueryCoreVariableModel for keepQueryOptions', () => {
        const currentVariable = {
          state: {
            ...sceneVariable.state,
            refresh: VariableRefresh.onDashboardLoad,
            isMulti: true,
            definition: undefined,
            skipUrlSync: true,
            includeAll: undefined,
          },
        } as any;
        const result = convertToQueryVariable(commonProperties, currentVariable, true);

        expect(result).toEqual({
          ...commonProperties,
          current: { value: currentVariable.state.value, text: currentVariable.state.text },
          type: VariableType.QUERY,
          options: [],
          query: currentVariable.state.query,
          definition: '',
          datasource: currentVariable.state.datasource,
          sort: currentVariable.state.sort,
          refresh: currentVariable.state.refresh,
          regex: currentVariable.state.regex,
          allValue: currentVariable.state.allValue,
          includeAll: false,
          multi: true,
          skipUrlSync: true,
        });
      });
    });

    describe('convertToCustomVariable', () => {
      it('Should return correct CoreCustomVariableModel', () => {
        const currentVariable = {
          state: {
            ...sceneVariable.state,
            refresh: VariableRefresh.onDashboardLoad,
            isMulti: true,
            definition: undefined,
            skipUrlSync: true,
            includeAll: undefined,
          },
        } as any;

        const result = convertToCustomVariable(commonProperties, currentVariable);

        expect(result).toEqual({
          ...commonProperties,
          current: { value: currentVariable.state.value, text: currentVariable.state.text },
          type: VariableType.CUSTOM,
          options: [],
          query: currentVariable.state.query,
          allValue: currentVariable.state.allValue,
          includeAll: false,
          multi: true,
        });
      });
    });

    describe('convertToDataSourceVariable', () => {
      it('Should return correct DataSourceVariableModel', () => {
        const currentVariable = {
          state: {
            ...sceneVariable.state,
            refresh: VariableRefresh.never,
            isMulti: true,
            definition: undefined,
            skipUrlSync: true,
            query: undefined,
            includeAll: true,
            regex: 'test',
          },
        } as any;

        const result = convertToDataSourceVariable(commonProperties, currentVariable);

        expect(result).toEqual({
          ...commonProperties,
          current: { value: currentVariable.state.value, text: currentVariable.state.text },
          type: VariableType.DATASOURCE,
          options: [],
          refresh: 1,
          regex: 'test',
          query: undefined,
          allValue: currentVariable.state.allValue,
          includeAll: true,
          multi: true,
        });
      });

      it('Should return correct DataSourceVariableModel if isMulti and includeAll undefined', () => {
        const currentVariable = {
          state: {
            ...sceneVariable.state,
            refresh: VariableRefresh.never,
            isMulti: undefined,
            definition: undefined,
            skipUrlSync: true,
            query: undefined,
            includeAll: undefined,
            regex: 'test',
          },
        } as any;

        const result = convertToDataSourceVariable(commonProperties, currentVariable);

        expect(result).toEqual({
          ...commonProperties,
          current: { value: currentVariable.state.value, text: currentVariable.state.text },
          type: VariableType.DATASOURCE,
          options: [],
          refresh: 1,
          regex: 'test',
          query: undefined,
          allValue: currentVariable.state.allValue,
          includeAll: false,
          multi: false,
        });
      });
    });

    describe('convertToTextBoxVariable', () => {
      it('Should return correct TextBoxVariableModel', () => {
        const currentVariable = {
          state: {
            ...sceneVariable.state,
            refresh: VariableRefresh.never,
            isMulti: true,
            definition: undefined,
            skipUrlSync: true,
            query: undefined,
            includeAll: true,
            regex: 'test',
          },
        } as any;

        const result = convertToTextBoxVariable(commonProperties, currentVariable);

        expect(result).toEqual({
          ...commonProperties,
          current: { value: currentVariable.state.value, text: currentVariable.state.value },
          type: VariableType.TEXTBOX,
          options: [
            {
              selected: true,
              text: 1,
              value: 1,
            },
          ],
          originalQuery: 1,
          query: 1,
        });
      });
    });

    describe('convertToConstantVariable', () => {
      it('Should return correct ConstantVariableModel', () => {
        const currentVariable = {
          state: {
            ...sceneVariable.state,
            refresh: VariableRefresh.never,
            isMulti: true,
            definition: undefined,
            skipUrlSync: true,
            query: undefined,
            includeAll: true,
            regex: 'test',
          },
        } as any;

        const result = convertToConstantVariable(commonProperties, currentVariable);

        expect(result).toEqual({
          ...commonProperties,
          current: { value: currentVariable.state.value, text: currentVariable.state.value },
          type: VariableType.CONSTANT,
          hide: VariableHide.hideVariable,
          options: [
            {
              selected: true,
              text: '1',
              value: '1',
            },
          ],
          query: '1',
        });
      });
    });

    describe('convertToIntervalVariable', () => {
      it('Should return correct ConstantVariableModel', () => {
        const currentVariable = {
          state: {
            ...sceneVariable.state,
            refresh: VariableRefresh.never,
            isMulti: true,
            definition: undefined,
            skipUrlSync: true,
            query: undefined,
            includeAll: true,
            regex: 'test',
            intervals: ['10', '20', '30'],
            autoMinInterval: '10',
            autoStepCount: 10,
            autoEnabled: true,
          },
        } as any;

        const result = convertToIntervalVariable(commonProperties, currentVariable);

        expect(result).toEqual({
          ...commonProperties,
          current: { value: currentVariable.state.value, text: currentVariable.state.value },
          type: VariableType.INTERVAL,
          auto: true,
          options: [
            {
              selected: false,
              text: '10',
              value: '10',
            },
            {
              selected: false,
              text: '20',
              value: '20',
            },
            {
              selected: false,
              text: '30',
              value: '30',
            },
          ],
          query: '10,20,30',
          refresh: VariableRefresh.never,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          auto_min: currentVariable.state.autoMinInterval,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          auto_count: currentVariable.state.autoStepCount,
        });
      });
    });

    describe('convertToAdhocVariable', () => {
      it('Should return correct AdHocVariableModel', () => {
        const currentVariable = {
          state: {
            ...sceneVariable.state,
            filters: [{}],
            defaultKeys: [{}],
            baseFilters: [{}],
          },
        } as any;

        const result = convertToAdhocVariable(commonProperties, currentVariable);

        expect(result).toEqual({
          ...commonProperties,
          type: VariableType.ADHOC,
          datasource: currentVariable.state.datasource,
          filters: [{}],
          defaultKeys: [{}],
          baseFilters: [{}],
        });
      });
    });

    describe('getVariablesCompability', () => {
      it('Should return correct types for variables from getVariablesCompatibility', () => {
        const set = {
          state: {
            variables: [
              {
                state: {
                  ...sceneVariable.state,
                  type: VariableType.QUERY,
                },
              },
              {
                state: {
                  ...sceneVariable.state,
                  type: VariableType.CUSTOM,
                },
              },
              {
                state: {
                  ...sceneVariable.state,
                  type: VariableType.DATASOURCE,
                },
              },
              {
                state: {
                  ...sceneVariable.state,
                  type: VariableType.CONSTANT,
                },
              },
              {
                state: {
                  ...sceneVariable.state,
                  type: VariableType.TEXTBOX,
                },
              },
              {
                state: {
                  ...sceneVariable.state,
                  type: VariableType.TEXTBOX,
                },
              },
              {
                state: {
                  ...sceneVariable.state,
                  type: VariableType.INTERVAL,
                  intervals: [],
                },
              },
              {
                state: {
                  ...sceneVariable.state,
                  type: VariableType.ADHOC,
                },
              },
            ],
          },
        } as any;
        const result = getVariablesCompatibility(set, true);

        expect(result.length).toEqual(8);

        expect(result[0]).toMatchObject({
          type: VariableType.QUERY,
        });

        expect(result[1]).toMatchObject({
          type: VariableType.CUSTOM,
        });

        expect(result[2]).toMatchObject({
          type: VariableType.DATASOURCE,
        });

        expect(result[3]).toMatchObject({
          type: VariableType.CONSTANT,
        });

        expect(result[4]).toMatchObject({
          type: VariableType.TEXTBOX,
        });

        expect(result[5]).toMatchObject({
          type: VariableType.TEXTBOX,
        });

        expect(result[6]).toMatchObject({
          type: VariableType.INTERVAL,
        });

        expect(result[7]).toMatchObject({
          type: VariableType.ADHOC,
        });
      });
    });
  });
});

import { locationService } from '@grafana/runtime';
import { AllValue, AllValueParameter } from '../constants';
import { VariableType } from '../types';
import { selectVariableValues } from './variable';

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
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: 'value1',
          },
          true
        );
      });

      it('Should apply all value', () => {
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [] };
        selectVariableValues([AllValueParameter], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: AllValue,
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
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [], multi: true };
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2'],
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
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1', 'selected2'],
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
        selectVariableValues(['value1', 'value2'], variable as any);

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
        selectVariableValues(['value1', AllValueParameter], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: AllValue,
          },
          true
        );

        /**
         * Check case-insensitive of all value
         */
        jest.mocked(locationService.partial).mockClear();
        selectVariableValues(['value1', AllValueParameter], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: AllValue,
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
        selectVariableValues(['value1', 'value2'], variable as any);

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
        const variable = { name: 'variable', type: VariableType.CUSTOM, options: [], multi: true };
        selectVariableValues(['value1', 'value2'], variable as any);

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
          options: [
            { text: 'selected1', selected: true },
            { text: 'notSelected', selected: false },
          ],
          multi: true,
        };
        selectVariableValues(['value1', 'value2'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: ['value1', 'value2', 'selected1'],
          },
          true
        );
      });
    });

    describe('Text Box', () => {
      it('Should apply only first value', () => {
        const variable = { name: 'variable', type: VariableType.TEXTBOX };
        selectVariableValues(['value1'], variable as any);

        expect(locationService.partial).toHaveBeenCalledWith(
          {
            [`var-${variable.name}`]: 'value1',
          },
          true
        );
      });
    });

    it('Should not apply value if no variable passed', () => {
      selectVariableValues(['value1']);

      expect(locationService.partial).not.toHaveBeenCalled();
    });

    it('Should not apply value for unsupported variable type', () => {
      const variable = { name: 'variable', type: VariableType.ADHOC };
      selectVariableValues(['value1'], variable as any);

      expect(locationService.partial).not.toHaveBeenCalled();
    });
  });
});

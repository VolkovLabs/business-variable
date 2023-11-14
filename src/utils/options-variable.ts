import { AllValueParameter, NoValueParameter } from '../constants';
import { RuntimeVariableWithOptions } from '../types';
import { selectVariableValues } from './variable';

/**
 * Update Variable Options
 * Another file for simple checking selectVariableValues calling
 */
export const updateVariableOptions = ({
  previousValues,
  value,
  emptyValueEnabled,
  variable,
}: {
  previousValues: string[];
  value: string | string[];
  emptyValueEnabled: boolean;
  variable: RuntimeVariableWithOptions;
}) => {
  const updatedValues = Array.isArray(value) ? value : [value];

  /**
   * Deselect values
   */
  if (previousValues.length > updatedValues.length) {
    /**
     * Clear Value
     */
    if (updatedValues.length === 0 && emptyValueEnabled) {
      selectVariableValues([NoValueParameter], variable);
      return;
    }

    /**
     * Select all
     */
    if (updatedValues.length === 0 && variable?.multi && variable.includeAll) {
      selectVariableValues([AllValueParameter], variable);
      return;
    }

    const removedValues = previousValues.filter((value) => !updatedValues.includes(value));
    selectVariableValues(removedValues, variable);
    return;
  }

  /**
   * Selected value while All is selected
   */
  if (
    updatedValues.length > 1 &&
    previousValues.includes(AllValueParameter) &&
    updatedValues.includes(AllValueParameter)
  ) {
    selectVariableValues(
      updatedValues.filter((value) => value !== AllValueParameter),
      variable
    );
    return;
  }

  /**
   * Select All Value
   */
  if (
    updatedValues.length > 1 &&
    !previousValues.includes(AllValueParameter) &&
    updatedValues.includes(AllValueParameter)
  ) {
    selectVariableValues([AllValueParameter], variable);
    return;
  }

  /**
   * Select Values
   */
  selectVariableValues(updatedValues, variable);
};

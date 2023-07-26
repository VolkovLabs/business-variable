import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Input } from '@grafana/ui';
import { TestIds } from '../../constants';
import { TextBoxVariable } from '../../types';
import { selectVariableValues } from '../../utils';

/**
 * Properties
 */
interface Props {
  /**
   * Variable
   */
  variable: TextBoxVariable;
}

/**
 * Text Variable
 * @param props
 */
export const TextVariable: React.FC<Props> = ({ variable }) => {
  /**
   * State
   */
  const [value, setValue] = useState(variable.current.value?.toString() || '');

  /**
   * Sync variable and local value
   */
  useEffect(() => {
    setValue(variable.current.value?.toString() || '');
  }, [variable]);

  /**
   * On Change
   */
  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setValue(value);
  }, []);

  /**
   * On Save
   */
  const onSave = useCallback(() => {
    selectVariableValues([value], variable);
  }, [value, variable]);

  return <Input data-testid={TestIds.textVariable.root} onChange={onChange} onBlur={onSave} value={value} />;
};

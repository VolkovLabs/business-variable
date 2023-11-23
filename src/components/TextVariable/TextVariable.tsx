import { Input } from '@grafana/ui';
import React, { ChangeEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';

import { TEST_IDS } from '../../constants';
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
    setValue(event.target.value);
  }, []);

  /**
   * On Save
   */
  const onSave = useCallback(() => {
    selectVariableValues([value], variable);
  }, [value, variable]);

  /**
   * On Key Down
   */
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        onSave();
      }

      if (event.key === 'Escape') {
        event.currentTarget.blur();
      }
    },
    [onSave]
  );

  return (
    <Input
      data-testid={TEST_IDS.textVariable.root}
      onChange={onChange}
      onBlur={onSave}
      onKeyDown={onKeyDown}
      value={value}
      placeholder="Enter variable value"
    />
  );
};

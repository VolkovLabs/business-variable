import { Alert } from '@grafana/ui';
import React, { useMemo } from 'react';

import { NO_VARIABLE_DEFAULT_MESSAGE, TEST_IDS } from '../../../../constants';
import { PanelOptions, RuntimeVariable, TableItem } from '../../../../types';

interface TableErrorMessageProps {
  /**
   * Runtime Variable
   */
  runtimeVariable: RuntimeVariable | undefined;

  /**
   * Options
   */
  options: PanelOptions;

  /**
   * Table data
   */
  tableData: TableItem[];

  /**
   * Current Group
   */
  currentGroup: string;
}

export const TableErrorMessage = ({ runtimeVariable, options, tableData, currentGroup }: TableErrorMessageProps) => {
  /**
   * Error message for current group
   */
  const currentGroupNoDataMessage = useMemo(() => {
    if (options.groups?.length && currentGroup) {
      const groupMessage = options.groups.find((group) => group.name === currentGroup)?.noDataCustomMessage;

      return groupMessage || '';
    }

    return '';
  }, [currentGroup, options.groups]);

  /**
   * Check variable
   */
  if (!runtimeVariable) {
    return (
      <Alert data-testid={TEST_IDS.tableErrorMessage.infoMessage} severity="info" title="Variable">
        {options.alertCustomMessage || NO_VARIABLE_DEFAULT_MESSAGE}
      </Alert>
    );
  }

  /**
   * Check table data
   */
  if (!tableData.length) {
    return (
      <Alert data-testid={TEST_IDS.tableErrorMessage.noDataMessage} severity="info" title="Variable">
        {currentGroupNoDataMessage || `The table currently contains no data to display.`}
      </Alert>
    );
  }

  return <></>;
};

import React from 'react';
import { PanelProps } from '@grafana/data';
import { DisplayMode, PanelOptions } from '../../types';
import { MinimizeView } from '../MinimizeView';
import { TableView } from '../TableView';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const VariablePanel: React.FC<Props> = ({ options, ...restProps }) => {
  if (options.displayMode === DisplayMode.MINIMIZE) {
    return <MinimizeView options={options} {...restProps} />;
  }

  return <TableView options={options} {...restProps} />;
};

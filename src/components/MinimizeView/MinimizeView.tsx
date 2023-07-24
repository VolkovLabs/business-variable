import React from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions } from '../../types';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Minimize View
 */
export const MinimizeView: React.FC<Props> = () => <div>minimize view</div>;

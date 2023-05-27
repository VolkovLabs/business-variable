import React from 'react';
import { css, cx } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { TestIds } from '../../constants';
import { Styles } from '../../styles';
import { PanelOptions } from '../../types';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const AbcPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const styles = Styles();

  /**
   * Get Field
   */
  const field = data.series
    .map((series) => series.fields.find((field) => field.name === options.name))
    .map((field) => field?.values.get(field.values.length - 1))
    .toString();

  /**
   * Return
   */
  return (
    <div
      data-testid={TestIds.panel.root}
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      {field}
    </div>
  );
};

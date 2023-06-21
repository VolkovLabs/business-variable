import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

/**
 * Styles
 */
export const Styles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css`
      position: relative;
      overflow: auto;
    `,
    label: css`
      display: flex;
      align-items: center;
      cursor: pointer;
    `,
    selectControl: css`
      vertical-align: middle;
    `,
    status: css`
      display: block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: ${theme.spacing(1)};
    `,
  };
};

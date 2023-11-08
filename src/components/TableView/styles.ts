import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const Styles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css`
      position: relative;
    `,
    content: css`
      position: absolute;
      overflow: auto;
    `,
    header: css`
      position: sticky;
      top: 0;
      background-color: ${theme.colors.background.primary};
    `,
    rowContent: css`
      display: flex;
      justify-content: stretch;
    `,
    expandButton: css`
      margin-right: ${theme.spacing(1)};
    `,
    label: css`
      display: flex;
      align-items: center;
      cursor: pointer;
      flex: auto;
    `,
    selectControl: css`
      vertical-align: middle;
      margin-right: ${theme.spacing(1)};
    `,
    status: css`
      display: block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: ${theme.spacing(1)};
      flex: none;
    `,
  };
};

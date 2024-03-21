import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css`
      position: relative;
    `,
    content: css`
      position: absolute;
      overflow: auto;
      overflow-x: hidden;
    `,
    header: css`
      position: sticky;
      top: 0;
      background-color: ${theme.colors.background.primary};
      z-index: 120;
    `,
    rowContent: css`
      display: flex;
      justify-content: stretch;
      align-items: center;
    `,
    expandButton: css`
      margin-right: ${theme.spacing(1)};
    `,
    label: css`
      display: flex;
      align-items: center;
      cursor: pointer;
      flex: auto;
      word-break: break-all;
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
    toolbar: css`
      div > div {
        flex-direction: column;
      }
      padding: ${theme.spacing(0.5)} 0 ${theme.spacing(0.5)} ${theme.spacing(1)};
      border-bottom: 1px solid ${theme.colors.border.weak};
    `,
  };
};

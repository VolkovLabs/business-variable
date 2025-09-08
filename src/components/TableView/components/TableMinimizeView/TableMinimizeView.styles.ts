import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    openDrawerButton: css`
      margin-left: ${theme.spacing(1)};
    `,
    openDrawerButtonCustomIcon: css`
      width: 24px;
      height: 24px;
      margin: ${theme.spacing(0.5)} ${theme.spacing(1)};
      vertical-align: middle;
      cursor: pointer;
    `,
    minimizeTableView: css`
      margin-top: ${theme.spacing(1)};
      margin-right: ${theme.spacing(1)};
      display: flex;
      flex-direction: row;
    `,
  };
};

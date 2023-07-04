import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const Styles = (theme: GrafanaTheme2) => {
  return {
    newGroup: css`
      margin: ${theme.spacing(2)} 0;
    `,
    groupHeader: css`
      display: flex;
    `,
    groupRemove: css`
      margin-left: ${theme.spacing(1)};
    `,
  };
};
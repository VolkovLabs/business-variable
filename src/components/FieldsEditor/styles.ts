import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

/**
 * Styles
 */
export const Styles = (theme: GrafanaTheme2) => {
  return {
    newGroup: css`
      margin: ${theme.spacing(2)} 0;
    `,
  };
};

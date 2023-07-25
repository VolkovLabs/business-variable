import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';

/**
 * Styles
 */
export const Styles = (theme: GrafanaTheme2) => {
  return {
    root: css`
      padding: ${theme.spacing(1)};
      overflow: auto;
    `,
  };
};

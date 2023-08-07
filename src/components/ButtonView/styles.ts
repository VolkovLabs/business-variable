import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const Styles = (theme: GrafanaTheme2) => {
  return {
    root: css`
      display: flex;
      gap: ${theme.spacing(0.5)};
      flex-wrap: wrap;
    `,
  };
};

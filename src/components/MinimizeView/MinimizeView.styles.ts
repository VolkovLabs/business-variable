import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    field: css`
      label {
        color: ${theme.colors.text.link};
        background: ${theme.colors.background.primary};
        border: 1px solid ${theme.colors.border.weak};
      }
    `,
  };
};

import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    root: css`
      display: flex;
      gap: ${theme.spacing(0.5)};
      flex-wrap: wrap;
    `,
    label: css`
      color: ${theme.colors.text.link};
      background: ${theme.colors.background.primary};
      border: 1px solid ${theme.colors.border.weak};
      margin: ${theme.spacing(0.25, 0)};
    `,
    resetButton: css`
      margin-left: ${theme.spacing(1)};
    `,
  };
};

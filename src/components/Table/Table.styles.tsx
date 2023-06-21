import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const Styles = (theme: GrafanaTheme2) => {
  const rowHoverBg = theme.colors.emphasize(theme.colors.background.primary, 0.03);

  return {
    table: css`
      border-radius: ${theme.shape.borderRadius()};
      width: 100%;

      td {
        padding: ${theme.spacing(1)};
      }

      td,
      th {
        min-width: ${theme.spacing(3)};
      }
    `,
    disableGrow: css`
      width: 0;
    `,
    header: css`
      border-bottom: 1px solid ${theme.colors.border.weak};
      &,
      & > button {
        position: relative;
        white-space: nowrap;
        padding: ${theme.spacing(1)};
      }
      & > button {
        &:after {
          content: '\\00a0';
        }
        width: 100%;
        height: 100%;
        background: none;
        border: none;
        padding-right: ${theme.spacing(2.5)};
        text-align: left;
        font-weight: ${theme.typography.fontWeightMedium};
      }
    `,
    row: css`
      border-bottom: 1px solid ${theme.colors.border.weak};

      &:hover {
        background-color: ${rowHoverBg};
      }

      &:last-child {
        border-bottom: 0;
      }
    `,
    expandedRow: css`
      border-bottom: none;
    `,
    expandedContentRow: css`
      td {
        border-bottom: 1px solid ${theme.colors.border.weak};
        position: relative;
        padding: ${theme.spacing(2, 2, 2, 5)};

        &:before {
          content: '';
          position: absolute;
          width: 1px;
          top: 0;
          left: 16px;
          bottom: ${theme.spacing(2)};
          background: ${theme.colors.border.medium};
        }
      }
    `,
    sortableHeader: css`
      /* increases selector's specificity so that it always takes precedence over default styles  */
      && {
        padding: 0;
      }
    `,
  };
};

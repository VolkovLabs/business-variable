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
      position: sticky;
      background-color: ${theme.colors.background.primary};
      box-shadow: 0 1px ${theme.colors.border.weak};
    `,
    headerCell: css`
      padding: ${theme.spacing(1)};
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
        cursor: pointer;
      }
    `,
    headerButton: css`
      margin-left: ${theme.spacing(0.5)};
    `,
    filterContainer: css`
      background-color: ${theme.colors.background.primary};
      padding: ${theme.spacing(1)};
    `,
    filterInput: css`
      margin-top: ${theme.spacing(0.5)};
    `,
  };
};

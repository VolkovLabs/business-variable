import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    newGroup: css`
      margin: ${theme.spacing(2)} 0;
    `,
    group: css`
      margin-bottom: ${theme.spacing(1)};
    `,
    groupHeader: css`
      min-height: ${theme.spacing(4)};
      padding: ${theme.spacing(0.5)};
    `,
    groupHeaderForm: css`
      display: flex;
      align-items: center;
      gap: ${theme.spacing(0.5)};
    `,
    groupHeaderText: css`
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: ${theme.spacing(4)};
    `,
    fieldName: css`
      margin: 0;
    `,
    dragHandle: css`
      display: flex;
      margin: ${theme.spacing(0, 0.5)};
    `,
    dragIcon: css`
      cursor: grab;
      color: ${theme.colors.text.disabled};
      &:hover {
        color: ${theme.colors.text};
      }
    `,
    actionButton: css`
      color: ${theme.colors.text.secondary};
    `,
  };
};

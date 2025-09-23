import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2) => {
  return {
    header: css`
      position: sticky;
      top: 0;
      background-color: ${theme.colors.background.primary};
      z-index: 120;
    `,
    toolbar: css`
      div > div {
        flex-direction: column;
        max-width: 100%;
      }
      padding: ${theme.spacing(0.5)} 0 ${theme.spacing(0.5)} ${theme.spacing(1)};
      border-bottom: 1px solid ${theme.colors.border.weak};
    `,
    tabWithPin: css`
      position: relative;
      display: flex;
      align-items: center;
    `,
    toolbarButton: css`
      position: relative;
      overflow: hidden;
      max-width: 100%;

      > div {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
    tabContent: css`
      display: flex;
      align-items: center;
      gap: ${theme.spacing(0.5)};
      width: 100%;
      justify-content: space-between;
    `,
    tabText: css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    `,
    pinButton: css`
      transition: opacity 0.2s ease;
      color: ${theme.colors.text.secondary};
      flex-shrink: 0;

      &:hover {
        opacity: 1;
        color: ${theme.colors.text.link};
        background: ${theme.colors.border.weak};
      }

      &:focus-visible {
        opacity: 1;
      }
    `,
    pinButtonActive: css`
      opacity: 1;
      color: ${theme.colors.primary.main};

      &:hover {
        color: ${theme.colors.primary.shade};
      }
    `,
    selectContainer: css`
      padding: ${theme.spacing(1, 2, 0, 1)};
    `,
  };
};

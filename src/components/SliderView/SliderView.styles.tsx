import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

/**
 * Styles
 */
export const getStyles = (theme: GrafanaTheme2, text: string, panelWidth: number) => {
  return {
    root: css`
      display: flex;
      gap: ${theme.spacing(0.5)};
      flex-wrap: wrap;
    `,
    field: css`
      flex: auto;
      align-items: center;

      label {
        color: ${theme.colors.text.link};
        background: ${theme.colors.background.primary};
        border: 1px solid ${theme.colors.border.weak};
      }
    `,
    label: css`
      color: ${theme.colors.text.link};
      background: ${theme.colors.background.primary};
      border: 1px solid ${theme.colors.border.weak};
      margin: ${theme.spacing(0.25, 0)};
    `,
    slider: css`
      margin-left: ${theme.spacing(1)};
      width: 90%;

      .rc-slider-dot:first-of-type {
        left: 0 !important;
      }

      .rc-slider-mark-text:first-of-type {
        left: 0 !important;
      }

      .rc-slider-dot {
        left: 100% !important;
      }

      .rc-slider-mark-text {
        left: 100% !important;
      }

      .rc-slider-handle::after {
        content: '${text}';
        position: absolute;
        top: ${theme.spacing(2.25)};
        right: -${theme.spacing(2.25)};
        font-size: 12px;
        background: ${theme.colors.background.primary};
        color: ${theme.colors.secondary.text};
        padding: ${theme.spacing(0.5)};
        left: 50%;
        transform: translateX(-50%);
        width: max-content;
        max-width: ${panelWidth - 80}px;
      }
    `,
  };
};

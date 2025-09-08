import { ButtonInfo } from '../types';

/**
 * Get button type
 * @param target
 * @param display
 */
export const getButtonInfo = (target: HTMLElement): ButtonInfo | null => {
  const dockedMenuButton = target.id === 'dock-menu-button' || target.closest('#dock-menu-button');
  if (dockedMenuButton) {
    const button = (target.closest('[id*="dock-menu-button"]') as HTMLElement) || target;
    return {
      type: 'dock',
      element: button,
      ariaLabel: button.getAttribute('aria-label'),
    };
  }

  const megaMenuToggle =
    target.id === 'mega-menu-toggle' ||
    target.id === 'mega-menu-header-toggle' ||
    target.closest('#mega-menu-toggle') ||
    target.closest('#mega-menu-header-toggle');

  if (megaMenuToggle) {
    const button = (target.closest('[id*="mega-menu"]') as HTMLElement) || target;
    return {
      type: 'mega',
      element: button,
      ariaLabel: button.getAttribute('aria-label'),
    };
  }

  return null;
};

/**
 * Check if the menu opens
 * @param ariaLabel
 */
export const isMenuOpenAction = (ariaLabel: string | null): boolean => {
  return ariaLabel === 'Dock menu' || ariaLabel === 'Open menu';
};

/**
 * Check if the menu close
 * @param ariaLabel
 */
export const isMenuCloseAction = (ariaLabel: string | null): boolean => {
  return ariaLabel === 'Undock menu' || ariaLabel === 'Close menu';
};

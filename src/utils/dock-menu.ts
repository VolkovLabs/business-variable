import { selectors } from '@grafana/e2e-selectors';

import { DockMenuElements, MenuSize } from '../types';
import {
  createAndInsertElement,
  findElementById,
  findElementByTestId,
  getNavElementSize,
  toggleElementDisplay,
} from './dom-utils';

/**
 * Apply variables for docked menu and set up DOM elements
 * @param currentSize
 * @param setDockedMenuSize
 */
export const setupDockedMenuElements = (
  currentSize: MenuSize,
  setDockedMenuSize: (size: MenuSize) => void
): DockMenuElements => {
  const result: DockMenuElements = {
    dockMenuPosition: null,
    buttonTogglePosition: null,
    nativeDockMenu: null,
  };

  const dockElementDataAttr = selectors.components.NavMenu.Menu;
  const dockElementCurrent = findElementByTestId(dockElementDataAttr);
  const dockedButton = findElementById('dock-menu-button');

  if (!dockElementCurrent) {
    return result;
  }

  const nav = dockElementCurrent.querySelector('nav');

  if (nav) {
    const size = getNavElementSize(nav);

    /**
     * Update Sizes
     */
    if (currentSize.height === 0 || currentSize.width === 0) {
      setDockedMenuSize(size);
    }

    /**
     * Create elements for position
     */
    result.buttonTogglePosition = createAndInsertElement(nav, 'beforebegin');
    result.dockMenuPosition = createAndInsertElement(nav, 'append');
  }

  if (dockedButton) {
    result.buttonTogglePosition = createAndInsertElement(dockedButton, 'beforebegin');
  }

  /**
   * Hide native menu
   */
  const ulElement = dockElementCurrent.querySelector<HTMLElement>('ul');

  if (ulElement) {
    toggleElementDisplay(ulElement, 'none');
    result.nativeDockMenu = ulElement;
  }

  return result;
};

/**
 * Clear position elements
 */
export const clearPositionElements = (): DockMenuElements => {
  return {
    dockMenuPosition: null,
    buttonTogglePosition: null,
    nativeDockMenu: null,
  };
};

/**
 * Restore native menu
 * @param nativeDockMenu
 */
export const restoreNativeMenu = (nativeDockMenu: HTMLElement | null): void => {
  if (nativeDockMenu && nativeDockMenu.style.display === 'none') {
    toggleElementDisplay(nativeDockMenu, 'flex');
  }
};

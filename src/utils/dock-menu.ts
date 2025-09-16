import { selectors } from '@grafana/e2e-selectors';

import { DockMenuElements, MenuSize, TableViewPosition } from '../types';
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

/**
 * Function to handle window resize in docked menu
 */
export const handleResizeWindow = ({
  position,
  dockMenuPosition,
  buttonTogglePosition,
  applyVariablesToDockedMenu,
  clearMenuElements,
  restoreNativeMenu,
}: {
  position: TableViewPosition;
  dockMenuPosition: React.RefObject<HTMLElement | null>;
  buttonTogglePosition: React.RefObject<HTMLDivElement | null>;
  applyVariablesToDockedMenu: () => void;
  clearMenuElements: () => void;
  restoreNativeMenu: () => void;
}) => {
  /**
   * Apply for docked position
   */
  if (position === TableViewPosition.DOCKED) {
    /**
     * Get dock element
     */
    const dockElementDataAttr = selectors.components.NavMenu.Menu;
    const dockElementCurrent = findElementByTestId(dockElementDataAttr);

    if (dockElementCurrent) {
      /**
       * Apply variable panel in docked element if inserted elements were not added
       */
      if (!dockMenuPosition?.current && !buttonTogglePosition?.current) {
        applyVariablesToDockedMenu();
      }
      return;
    }

    if (!dockElementCurrent) {
      /**
       * Clear injected items if the dock has been removed from view
       */
      clearMenuElements();
      restoreNativeMenu();
    }
  }
};

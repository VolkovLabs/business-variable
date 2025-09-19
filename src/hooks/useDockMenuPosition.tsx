import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { MenuSize, TableViewPosition } from '../types';
import {
  clearPositionElements,
  getButtonInfo,
  handleResizeWindow,
  isMenuCloseAction,
  isMenuOpenAction,
  restoreNativeMenu,
  setContainerSize,
  setupDockedMenuElements,
  toggleElementDisplay,
} from '../utils';

/**
 * Props
 */
interface HookProps {
  /**
   * Position
   *
   * @type {TableViewPosition}
   */
  position: TableViewPosition;
}

/**
 * useDockMenuPosition hook
 */
export const useDockMenuPosition = ({ position }: HookProps) => {
  /**
   * Refs
   */
  const dockMenuPosition = useRef<HTMLElement | null>(null);
  const buttonTogglePosition = useRef<HTMLDivElement>(null);
  const nativeDockMenu = useRef<HTMLElement | null>(null);

  /**
   * States
   */
  const [isDockMenuDisplay, setIsDockMenuDisplay] = useState(false);
  /**
   * forceRerender
   * It is especially important for correct rendering together with useVirtualizer Table.tsx ()
   * at the moment when the dock menu is not fixed and is
   * rendered when opened in the portal.
   */
  const [forceRerender, setForceRerender] = useState(0);
  const [dockedMenuSize, setDockedMenuSize] = useState<MenuSize>({
    width: 0,
    height: 0,
  });

  /**
   * Toggle between native and variables menus
   */
  const dockMenuToggle = useCallback(() => {
    setIsDockMenuDisplay((prev) => !prev);
  }, []);

  /**
   * Force update handle
   */
  const forceUpdate = useCallback(() => {
    setForceRerender((prev) => prev + 1);
  }, []);

  const applyVariablesToDockedMenu = useCallback(() => {
    const elements = setupDockedMenuElements();

    dockMenuPosition.current = elements.dockMenuPosition;
    buttonTogglePosition.current = elements.buttonTogglePosition;
    nativeDockMenu.current = elements.nativeDockMenu;
  }, []);

  const clearMenuElements = useCallback(() => {
    const cleared = clearPositionElements();
    dockMenuPosition.current = cleared.dockMenuPosition;
    buttonTogglePosition.current = cleared.buttonTogglePosition;
  }, []);

  const updateSize = useCallback(() => {
    setContainerSize(setDockedMenuSize);
  }, []);

  /**
   * Handle menu click
   * It is necessary to determine
   * when the menu opens and closes,
   * as it may not be strictly fixed.
   */
  const handleMenuClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      /**
       * Define our button
       */
      const buttonInfo = getButtonInfo(target);

      if (!buttonInfo) return;

      if (buttonInfo.type === 'dock') {
        if (isMenuOpenAction(buttonInfo.ariaLabel)) {
          applyVariablesToDockedMenu();
          forceUpdate();
        } else if (isMenuCloseAction(buttonInfo.ariaLabel)) {
          clearMenuElements();
          forceUpdate();
        }
      }

      if (buttonInfo.type === 'mega') {
        if (isMenuOpenAction(buttonInfo.ariaLabel)) {
          applyVariablesToDockedMenu();
          forceUpdate();
          updateSize();
        } else if (isMenuCloseAction(buttonInfo.ariaLabel)) {
          clearMenuElements();
          forceUpdate();
        }
      }
    },
    [applyVariablesToDockedMenu, clearMenuElements, forceUpdate, updateSize]
  );

  const handleWindowResize = useCallback(() => {
    handleResizeWindow({
      position: position,
      dockMenuPosition: dockMenuPosition,
      buttonTogglePosition: buttonTogglePosition,
      applyVariablesToDockedMenu,
      clearMenuElements,
      restoreNativeMenu: () => restoreNativeMenu(nativeDockMenu.current),
    });
  }, [applyVariablesToDockedMenu, clearMenuElements, position]);

  useLayoutEffect(() => {
    if (position !== TableViewPosition.DOCKED) {
      return;
    }

    applyVariablesToDockedMenu();

    return () => {
      restoreNativeMenu(nativeDockMenu.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (position !== TableViewPosition.DOCKED) {
      return;
    }

    document.addEventListener('click', handleMenuClick);

    return () => {
      document.removeEventListener('click', handleMenuClick);
    };
  }, [applyVariablesToDockedMenu, handleMenuClick, position]);

  useLayoutEffect(() => {
    if (position !== TableViewPosition.DOCKED) {
      return;
    }
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [handleWindowResize, position]);

  /**
   * When switching menus, hide or show the corresponding menu.
   */
  useLayoutEffect(() => {
    if (isDockMenuDisplay && nativeDockMenu.current) {
      toggleElementDisplay(nativeDockMenu.current, 'flex');
      toggleElementDisplay(dockMenuPosition.current, 'none');
    }

    if (!isDockMenuDisplay && dockMenuPosition.current) {
      const currentDisplayStyle = dockMenuPosition.current.style.display;

      if (currentDisplayStyle !== 'block') {
        toggleElementDisplay(dockMenuPosition.current, 'block');
      }

      toggleElementDisplay(nativeDockMenu.current, 'none');
    }
  }, [isDockMenuDisplay]);

  useLayoutEffect(() => {
    if (position !== TableViewPosition.DOCKED) {
      return;
    }

    if (dockedMenuSize.height === 0 && dockedMenuSize.width === 0) {
      updateSize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (position !== TableViewPosition.DOCKED) {
      return;
    }

    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [position, dockedMenuSize, updateSize]);

  return {
    dockedMenuSize,
    dockMenuToggle,
    isDockMenuDisplay,
    dockMenuPosition,
    buttonTogglePosition,
    forceRerender,
  };
};

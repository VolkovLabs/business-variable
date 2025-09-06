/**
 * Menu size
 */
export interface MenuSize {
  /**
   * Width
   */
  width: number;

  /**
   * Height
   */
  height: number;
}

/**
 * Dock menu elements
 */
export interface DockMenuElements {
  /**
   * Dock menu position element
   */
  dockMenuPosition: HTMLElement | null;

  /**
   * Button toggle position element
   */
  buttonTogglePosition: HTMLDivElement | null;

  /**
   * Native dock menu element
   */
  nativeDockMenu: HTMLElement | null;
}

/**
 * Menu button type
 */
export type MenuButtonType = 'dock' | 'mega' | null;

/**
 * Button information
 */
export interface ButtonInfo {
  /**
   * Type of button
   */
  type: MenuButtonType;

  /**
   * HTML element
   */
  element: HTMLElement;

  /**
   * Aria label attribute value
   */
  ariaLabel: string | null;
}

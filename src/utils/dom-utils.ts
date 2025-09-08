import { MenuSize } from '../types';

/**
 * Create new Div element and insert it
 * @param targetElement
 * @param position
 */
export const createAndInsertElement = (
  targetElement: HTMLElement,
  position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend' | 'append'
): HTMLDivElement => {
  const newElement = document.createElement('div');

  if (position === 'append') {
    targetElement.append(newElement);
  } else {
    targetElement.insertAdjacentElement(position, newElement);
  }

  return newElement;
};

/**
 * get nav element size
 * @param nav
 */
export const getNavElementSize = (nav: HTMLElement): MenuSize => {
  const rect = nav.getBoundingClientRect();
  /**
   * 290 it is fallback width
   */
  return {
    width: rect.width > 0 ? rect.width : 290,
    height: rect.height,
  };
};

/**
 * Find dom element
 * @param testId
 */
export const findElementByTestId = (testId: string): HTMLElement | null => {
  return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
};

/**
 * Find dom element by id
 * @param id
 */
export const findElementById = (id: string): HTMLElement | null => {
  return document.getElementById(id);
};

/**
 * Toggle elements display styles
 * @param element
 * @param display
 */
export const toggleElementDisplay = (element: HTMLElement | null, display: 'none' | 'block' | 'flex'): void => {
  if (element) {
    element.style.display = display;
  }
};

export const isElementHidden = (element: HTMLElement): boolean => {
  return element.style.display === 'none';
};

export const getAriaLabel = (element: HTMLElement): string | null => {
  return element.getAttribute('aria-label');
};

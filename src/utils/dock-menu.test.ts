import * as domUtils from './dom-utils';
import { MenuSize } from 'types';
import { setupDockedMenuElements, clearPositionElements, restoreNativeMenu } from './dock-menu';

/**
 * Mock @grafana/e2e-selectors
 */
jest.mock('@grafana/e2e-selectors', () => ({
  selectors: {
    components: {
      NavMenu: {
        Menu: 'nav-menu-test-id',
      },
    },
  },
}));

/**
 * Mock dom utils
 */
jest.mock('./dom-utils', () => ({
  createAndInsertElement: jest.fn(),
  findElementById: jest.fn(),
  findElementByTestId: jest.fn(),
  getNavElementSize: jest.fn(),
  toggleElementDisplay: jest.fn(),
}));

describe('dock-menu utils', () => {
  let container: HTMLElement;
  let mockDockElement: HTMLDivElement;
  let mockNav: HTMLElement;
  let mockUl: HTMLUListElement;
  let mockDockedButton: HTMLButtonElement;
  let mockCreatedDiv: HTMLDivElement;

  beforeEach(() => {
    /**
     * Clear all mocks
     */
    jest.clearAllMocks();

    /**
     * Setup DOM container
     */
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);

    /**
     * Create mock DOM elements
     */
    mockDockElement = document.createElement('div');
    mockDockElement.setAttribute('data-testid', 'nav-menu-test-id');

    mockNav = document.createElement('nav');
    mockUl = document.createElement('ul');
    mockDockedButton = document.createElement('button');
    mockDockedButton.id = 'dock-menu-button';
    mockCreatedDiv = document.createElement('div');

    /**
     * Setup default mock returns
     */
    jest.mocked(domUtils.createAndInsertElement).mockReturnValue(mockCreatedDiv);
    jest.mocked(domUtils.getNavElementSize).mockReturnValue({ width: 300, height: 200 });
    jest.mocked(domUtils.findElementByTestId).mockReturnValue(null);
    jest.mocked(domUtils.findElementById).mockReturnValue(null);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('setupDockedMenuElements', () => {
    it('Should return empty result when dock element does not exist', () => {
      /**
       * Mock findElementByTestId to return null
       */
      jest.mocked(domUtils.findElementByTestId).mockReturnValue(null);

      const currentSize: MenuSize = { width: 0, height: 0 };
      const setDockedMenuSize = jest.fn();

      const result = setupDockedMenuElements(currentSize, setDockedMenuSize);

      expect(result).toEqual({
        dockMenuPosition: null,
        buttonTogglePosition: null,
        nativeDockMenu: null,
      });
      expect(domUtils.findElementByTestId).toHaveBeenCalledWith('nav-menu-test-id');
      expect(setDockedMenuSize).not.toHaveBeenCalled();
    });

    it('Should prioritize docked button positioning over nav positioning', () => {
      /**
       * Setup both nav and docked button
       */
      mockDockElement.appendChild(mockNav);
      container.appendChild(mockDockElement);
      container.appendChild(mockDockedButton);

      mockDockElement.querySelector = jest.fn((selector) => {
        if (selector === 'nav') return mockNav;
        return null;
      });

      jest.mocked(domUtils.findElementByTestId).mockReturnValue(mockDockElement);
      jest.mocked(domUtils.findElementById).mockReturnValue(mockDockedButton);

      const currentSize: MenuSize = { width: 0, height: 0 };
      const setDockedMenuSize = jest.fn();

      setupDockedMenuElements(currentSize, setDockedMenuSize);

      /**
       * Should call createAndInsertElement for both nav and docked button
       * Docked button call should override nav button positioning
       */
      expect(domUtils.createAndInsertElement).toHaveBeenCalledWith(mockNav, 'beforebegin');
      expect(domUtils.createAndInsertElement).toHaveBeenCalledWith(mockNav, 'append');
      expect(domUtils.createAndInsertElement).toHaveBeenCalledWith(mockDockedButton, 'beforebegin');
    });
  });

  describe('clearPositionElements', () => {
    it('Should return cleared elements structure', () => {
      const result = clearPositionElements();

      expect(result).toEqual({
        dockMenuPosition: null,
        buttonTogglePosition: null,
        nativeDockMenu: null,
      });
    });
  });

  describe('restoreNativeMenu', () => {
    it('Should restore native menu display when element is hidden', () => {
      /**
       * Setup hidden ul element
       */
      mockUl.style.display = 'none';
      container.appendChild(mockUl);

      restoreNativeMenu(mockUl);

      expect(domUtils.toggleElementDisplay).toHaveBeenCalledWith(mockUl, 'flex');
    });

    it('Should not restore menu when display is not none', () => {
      /**
       * Setup visible ul element
       */
      mockUl.style.display = 'block';
      container.appendChild(mockUl);

      restoreNativeMenu(mockUl);

      expect(domUtils.toggleElementDisplay).not.toHaveBeenCalled();
    });

    it('Should not restore menu when display is flex', () => {
      /**
       * Setup ul element with flex display
       */
      mockUl.style.display = 'flex';
      container.appendChild(mockUl);

      restoreNativeMenu(mockUl);

      expect(domUtils.toggleElementDisplay).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Integration', () => {
    it('Should handle complex DOM structure with multiple nav elements', () => {
      /**
       * Create complex DOM structure
       */
      const secondNav = document.createElement('nav');
      mockDockElement.appendChild(mockNav);
      mockDockElement.appendChild(secondNav);
      mockDockElement.appendChild(mockUl);
      container.appendChild(mockDockElement);

      /**
       * Mock querySelector to return first nav
       */
      mockDockElement.querySelector = jest.fn((selector) => {
        if (selector === 'nav') return mockNav; // Returns first nav
        if (selector === 'ul') return mockUl;
        return null;
      });

      jest.mocked(domUtils.findElementByTestId).mockReturnValue(mockDockElement);

      const currentSize: MenuSize = { width: 0, height: 0 };
      const setDockedMenuSize = jest.fn();

      setupDockedMenuElements(currentSize, setDockedMenuSize);

      /**
       * Should work with first nav element
       */
      expect(domUtils.getNavElementSize).toHaveBeenCalledWith(mockNav);
      expect(domUtils.createAndInsertElement).toHaveBeenCalledWith(mockNav, 'beforebegin');
      expect(domUtils.createAndInsertElement).toHaveBeenCalledWith(mockNav, 'append');
    });
  });
});

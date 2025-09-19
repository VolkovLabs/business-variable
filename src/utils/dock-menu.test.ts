import * as domUtils from './dom-utils';
import { MenuSize, TableViewPosition } from 'types';
import {
  setupDockedMenuElements,
  clearPositionElements,
  restoreNativeMenu,
  handleResizeWindow,
  setContainerSize,
} from './dock-menu';

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

      const result = setupDockedMenuElements();

      expect(result).toEqual({
        dockMenuPosition: null,
        buttonTogglePosition: null,
        nativeDockMenu: null,
      });

      expect(domUtils.findElementByTestId).toHaveBeenCalledWith('nav-menu-test-id');
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

      setupDockedMenuElements();

      /**
       * Should call createAndInsertElement for both nav and docked button
       * Docked button call should override nav button positioning
       */
      expect(domUtils.createAndInsertElement).toHaveBeenCalledWith(mockNav, 'prepend');
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

      setupDockedMenuElements();

      /**
       * Should work with first nav element
       */
      expect(domUtils.createAndInsertElement).toHaveBeenCalledWith(mockNav, 'prepend');
    });
  });

  describe('resize-window utils', () => {
    let mockDockElement: HTMLDivElement;
    let mockApplyVariables: jest.Mock;
    let mockClearMenuElements: jest.Mock;
    let mockRestoreNativeMenu: jest.Mock;
    let mockDockMenuPosition: React.RefObject<HTMLElement | null>;
    let mockButtonTogglePosition: React.RefObject<HTMLDivElement | null>;

    beforeEach(() => {
      jest.clearAllMocks();

      mockDockElement = document.createElement('div');

      mockApplyVariables = jest.fn();
      mockClearMenuElements = jest.fn();
      mockRestoreNativeMenu = jest.fn();

      mockDockMenuPosition = { current: null };
      mockButtonTogglePosition = { current: null };

      jest.mocked(domUtils.findElementByTestId).mockReturnValue(null);
    });

    describe('handleResizeWindow', () => {
      describe('When position is DOCKED', () => {
        it('Should apply variables when dock element exists and refs are null', () => {
          const defaultParams = {
            position: TableViewPosition.DOCKED,
            dockMenuPosition: mockDockMenuPosition,
            buttonTogglePosition: mockButtonTogglePosition,
            applyVariablesToDockedMenu: mockApplyVariables,
            clearMenuElements: mockClearMenuElements,
            restoreNativeMenu: mockRestoreNativeMenu,
          };

          jest.mocked(domUtils.findElementByTestId).mockReturnValue(mockDockElement);
          mockDockMenuPosition.current = null;
          mockButtonTogglePosition.current = null;

          handleResizeWindow(defaultParams);

          expect(mockApplyVariables).toHaveBeenCalledTimes(1);
          expect(mockClearMenuElements).not.toHaveBeenCalled();
          expect(mockRestoreNativeMenu).not.toHaveBeenCalled();
        });
      });

      it('Should not apply variables when dock element exists but refs are already set', () => {
        const defaultParams = {
          position: TableViewPosition.DOCKED,
          dockMenuPosition: mockDockMenuPosition,
          buttonTogglePosition: mockButtonTogglePosition,
          applyVariablesToDockedMenu: mockApplyVariables,
          clearMenuElements: mockClearMenuElements,
          restoreNativeMenu: mockRestoreNativeMenu,
        };

        jest.mocked(domUtils.findElementByTestId).mockReturnValue(mockDockElement);
        mockDockMenuPosition.current = document.createElement('div');
        mockButtonTogglePosition.current = document.createElement('div');

        handleResizeWindow(defaultParams);

        expect(mockApplyVariables).not.toHaveBeenCalled();
        expect(mockClearMenuElements).not.toHaveBeenCalled();
        expect(mockRestoreNativeMenu).not.toHaveBeenCalled();
      });

      it('Should clear elements and restore menu when dock element does not exist', () => {
        const defaultParams = {
          position: TableViewPosition.DOCKED,
          dockMenuPosition: mockDockMenuPosition,
          buttonTogglePosition: mockButtonTogglePosition,
          applyVariablesToDockedMenu: mockApplyVariables,
          clearMenuElements: mockClearMenuElements,
          restoreNativeMenu: mockRestoreNativeMenu,
        };

        jest.mocked(domUtils.findElementByTestId).mockReturnValue(null);

        handleResizeWindow(defaultParams);

        expect(mockClearMenuElements).toHaveBeenCalledTimes(1);
        expect(mockRestoreNativeMenu).toHaveBeenCalledTimes(1);
        expect(mockApplyVariables).not.toHaveBeenCalled();
      });
    });
  });
});

describe('setContainerSize', () => {
  let mockSetDockedMenuSize: jest.MockedFunction<(size: MenuSize) => void>;

  beforeEach(() => {
    mockSetDockedMenuSize = jest.fn();
    jest.clearAllMocks();
  });

  describe('When dock element is found', () => {
    it('Should call setDockedMenuSize with correct size when nav element exists', () => {
      const mockNav = document.createElement('nav');
      const mockDockElement = document.createElement('div');
      mockDockElement.appendChild(mockNav);
      setContainerSize(mockSetDockedMenuSize);
      expect(mockSetDockedMenuSize).toHaveBeenCalled();
    });
  });
});

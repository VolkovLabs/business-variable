import { act, renderHook } from '@testing-library/react';

import * as dockMenuUtils from '../utils/dock-menu';
import * as eventUtils from '../utils/event-utils';
import { useDockMenuPosition } from './useDockMenuPosition';
import { TableViewPosition } from '../types';

/**
 * Mock dock menu utils
 */
jest.mock('../utils/dock-menu', () => ({
  setupDockedMenuElements: jest.fn(),
  clearPositionElements: jest.fn(),
  restoreNativeMenu: jest.fn(),
  handleResizeWindow: jest.fn(),
  setContainerSize: jest.fn(),
}));

/**
 * Mock event utils
 */
jest.mock('../utils/event-utils', () => ({
  getButtonInfo: jest.fn(),
  isMenuOpenAction: jest.fn(),
  isMenuCloseAction: jest.fn(),
}));

/**
 * Mock dom utils
 */
jest.mock('../utils/dom-utils', () => ({
  ...jest.requireActual('../utils/dom-utils'),
  toggleElementDisplay: jest.fn(),
}));

/**
 * Mock getBoundingClientRect for DOM elements
 */
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  value: jest.fn(() => ({
    width: 290,
    height: 150,
    top: 0,
    left: 0,
    bottom: 150,
    right: 290,
  })),
});

describe('useDockMenuPosition', () => {
  /**
   * Mock DOM elements for testing
   */
  let mockDockMenuPosition: HTMLDivElement;
  let mockButtonTogglePosition: HTMLDivElement;
  let mockNativeDockMenu: HTMLUListElement;
  let mockDockedButton: HTMLButtonElement;

  beforeEach(() => {
    /**
     * Clear all mocks
     */
    jest.clearAllMocks();

    /**
     * Create mock DOM elements
     */
    mockDockMenuPosition = document.createElement('div');
    mockButtonTogglePosition = document.createElement('div');
    mockNativeDockMenu = document.createElement('ul');
    mockDockedButton = document.createElement('button');
    mockDockedButton.id = 'dock-menu-button';

    /**
     * Setup default mock returns
     */
    jest.mocked(dockMenuUtils.setupDockedMenuElements).mockReturnValue({
      dockMenuPosition: mockDockMenuPosition,
      buttonTogglePosition: mockButtonTogglePosition,
      nativeDockMenu: mockNativeDockMenu,
    });

    jest.mocked(dockMenuUtils.clearPositionElements).mockReturnValue({
      dockMenuPosition: null,
      buttonTogglePosition: null,
      nativeDockMenu: null,
    });

    jest.mocked(eventUtils.getButtonInfo).mockReturnValue(null);
    jest.mocked(eventUtils.isMenuOpenAction).mockReturnValue(false);
    jest.mocked(eventUtils.isMenuCloseAction).mockReturnValue(false);

    /**
     * Clear document body
     */
    document.body.innerHTML = '';
  });

  describe('Hook Initialization', () => {
    it('Should initialize with correct default values', () => {
      const { result } = renderHook(() => useDockMenuPosition({ position: TableViewPosition.DOCKED }));

      expect(result.current.dockedMenuSize).toEqual({ width: 0, height: 0 });
      expect(result.current.isDockMenuDisplay).toBeFalsy();
      expect(result.current.forceRerender).toEqual(0);
      expect(typeof result.current.dockMenuToggle).toEqual('function');
      expect(result.current.dockMenuPosition).toBeDefined();
      expect(result.current.buttonTogglePosition).toBeDefined();
    });
  });

  describe('Dock Menu Toggle', () => {
    it('Should toggle isDockMenuDisplay from false to true', () => {
      const { result } = renderHook(() => useDockMenuPosition({ position: TableViewPosition.DOCKED }));

      expect(result.current.isDockMenuDisplay).toBeFalsy();

      act(() => {
        result.current.dockMenuToggle();
      });

      expect(result.current.isDockMenuDisplay).toBeTruthy();
    });
  });

  describe('Click Event Handling', () => {
    it('Should handle dock menu button open action', () => {
      /**
       * Setup button info mock for dock menu open
       */
      jest.mocked(eventUtils.getButtonInfo).mockReturnValue({
        type: 'dock',
        element: mockDockedButton,
        ariaLabel: 'Dock menu',
      });
      jest.mocked(eventUtils.isMenuOpenAction).mockReturnValue(true);
      jest.mocked(eventUtils.isMenuCloseAction).mockReturnValue(false);

      const { result } = renderHook(() => useDockMenuPosition({ position: TableViewPosition.DOCKED }));

      const initialRerenderCount = result.current.forceRerender;

      /**
       * Create and dispatch click event
       */
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', {
        value: mockDockedButton,
        enumerable: true,
      });

      act(() => {
        document.dispatchEvent(clickEvent);
      });

      /**
       * Initial + click
       */
      expect(dockMenuUtils.setupDockedMenuElements).toHaveBeenCalledTimes(2);
      expect(result.current.forceRerender).toEqual(initialRerenderCount + 1);
    });

    it('Should handle dock menu button close action', () => {
      /**
       * Setup button info mock for dock menu close
       */
      jest.mocked(eventUtils.getButtonInfo).mockReturnValue({
        type: 'dock',
        element: mockDockedButton,
        ariaLabel: 'Undock menu',
      });
      jest.mocked(eventUtils.isMenuOpenAction).mockReturnValue(false);
      jest.mocked(eventUtils.isMenuCloseAction).mockReturnValue(true);

      const { result } = renderHook(() => useDockMenuPosition({ position: TableViewPosition.DOCKED }));

      const initialRerenderCount = result.current.forceRerender;

      /**
       * Create and dispatch click event
       */
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', {
        value: mockDockedButton,
        enumerable: true,
      });

      act(() => {
        document.dispatchEvent(clickEvent);
      });

      expect(dockMenuUtils.clearPositionElements).toHaveBeenCalled();
      expect(result.current.forceRerender).toEqual(initialRerenderCount + 1);
    });

    it('Should handle mega menu button open action', () => {
      /**
       * Setup button info mock for mega menu open
       */
      const mockMegaButton = document.createElement('button');
      mockMegaButton.id = 'mega-menu-toggle';

      jest.mocked(eventUtils.getButtonInfo).mockReturnValue({
        type: 'mega',
        element: mockMegaButton,
        ariaLabel: 'Open menu',
      });
      jest.mocked(eventUtils.isMenuOpenAction).mockReturnValue(true);
      jest.mocked(eventUtils.isMenuCloseAction).mockReturnValue(false);

      const { result } = renderHook(() => useDockMenuPosition({ position: TableViewPosition.DOCKED }));

      const initialRerenderCount = result.current.forceRerender;

      /**
       * Create and dispatch click event
       */
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', {
        value: mockMegaButton,
        enumerable: true,
      });

      act(() => {
        document.dispatchEvent(clickEvent);
      });

      expect(dockMenuUtils.setupDockedMenuElements).toHaveBeenCalledTimes(2);
      expect(result.current.forceRerender).toEqual(initialRerenderCount + 1);
    });

    it('Should handle mega menu button close action', () => {
      /**
       * Setup button info mock for mega menu close
       */
      const mockMegaButton = document.createElement('button');
      mockMegaButton.id = 'mega-menu-toggle';

      jest.mocked(eventUtils.getButtonInfo).mockReturnValue({
        type: 'mega',
        element: mockMegaButton,
        ariaLabel: 'Close menu',
      });
      jest.mocked(eventUtils.isMenuOpenAction).mockReturnValue(false);
      jest.mocked(eventUtils.isMenuCloseAction).mockReturnValue(true);

      const { result } = renderHook(() => useDockMenuPosition({ position: TableViewPosition.DOCKED }));

      const initialRerenderCount = result.current.forceRerender;

      /**
       * Create and dispatch click event
       */
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', {
        value: mockMegaButton,
        enumerable: true,
      });

      act(() => {
        document.dispatchEvent(clickEvent);
      });

      expect(dockMenuUtils.clearPositionElements).toHaveBeenCalled();
      expect(result.current.forceRerender).toEqual(initialRerenderCount + 1);
    });

    it('Should ignore clicks on non-menu elements', () => {
      /**
       * Setup getButtonInfo to return null (non-menu element)
       */
      jest.mocked(eventUtils.getButtonInfo).mockReturnValue(null);

      const { result } = renderHook(() => useDockMenuPosition({ position: TableViewPosition.DOCKED }));

      const initialRerenderCount = result.current.forceRerender;

      /**
       * Create click event on non-menu element
       */
      const randomElement = document.createElement('div');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', {
        value: randomElement,
        enumerable: true,
      });

      act(() => {
        document.dispatchEvent(clickEvent);
      });

      /**
       * Should not trigger any actions
       */
      expect(result.current.forceRerender).toEqual(initialRerenderCount);
      expect(dockMenuUtils.setupDockedMenuElements).toHaveBeenCalledTimes(1);
      expect(dockMenuUtils.clearPositionElements).not.toHaveBeenCalled();
    });
  });

  describe('Window resize ', () => {
    it('Should handle window resize event for DOCKED position', () => {
      const { result } = renderHook(() => useDockMenuPosition({ position: TableViewPosition.DOCKED }));

      const resizeEvent = new Event('resize');

      act(() => {
        window.dispatchEvent(resizeEvent);
      });

      expect(dockMenuUtils.handleResizeWindow).toHaveBeenCalledWith({
        position: TableViewPosition.DOCKED,
        dockMenuPosition: result.current.dockMenuPosition,
        buttonTogglePosition: result.current.buttonTogglePosition,
        applyVariablesToDockedMenu: expect.any(Function),
        clearMenuElements: expect.any(Function),
        restoreNativeMenu: expect.any(Function),
      });
    });

    it('Should not handle window resize when position is not DOCKED', () => {
      renderHook(() => useDockMenuPosition({ position: TableViewPosition.MINIMIZE }));

      const resizeEvent = new Event('resize');

      act(() => {
        window.dispatchEvent(resizeEvent);
      });

      expect(dockMenuUtils.handleResizeWindow).not.toHaveBeenCalled();
    });

    it('Should call restoreNativeMenu function in resize handler', () => {
      jest.mocked(dockMenuUtils.handleResizeWindow).mockImplementation(({ restoreNativeMenu }) => {
        restoreNativeMenu();
      });

      renderHook(() => useDockMenuPosition({ position: TableViewPosition.DOCKED }));

      const resizeEvent = new Event('resize');

      act(() => {
        window.dispatchEvent(resizeEvent);
      });

      expect(dockMenuUtils.restoreNativeMenu).toHaveBeenCalledWith(mockNativeDockMenu);
    });
  });
});

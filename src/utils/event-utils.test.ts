import { getButtonInfo, isMenuOpenAction, isMenuCloseAction } from './event-utils';

describe('eventUtils', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getButtonInfo', () => {
    it('Should identify dock menu button by id', () => {
      const button = document.createElement('button');
      button.id = 'dock-menu-button';
      button.setAttribute('aria-label', 'Dock menu');
      container.appendChild(button);

      const info = getButtonInfo(button);

      expect(info).toEqual({
        type: 'dock',
        element: button,
        ariaLabel: 'Dock menu',
      });
    });

    it('Should identify dock menu button by closest selector', () => {
      const wrapper = document.createElement('div');
      wrapper.id = 'dock-menu-button';
      wrapper.setAttribute('aria-label', 'Dock menu');

      const button = document.createElement('button');
      wrapper.appendChild(button);
      container.appendChild(wrapper);

      const info = getButtonInfo(button);

      expect(info).toEqual({
        type: 'dock',
        element: wrapper,
        ariaLabel: 'Dock menu',
      });
    });

    it('Should identify mega menu toggle button', () => {
      const button = document.createElement('button');
      button.id = 'mega-menu-toggle';
      button.setAttribute('aria-label', 'Open menu');
      container.appendChild(button);

      const info = getButtonInfo(button);

      expect(info).toEqual({
        type: 'mega',
        element: button,
        ariaLabel: 'Open menu',
      });
    });

    it('Should identify mega menu header toggle button', () => {
      const button = document.createElement('button');
      button.id = 'mega-menu-header-toggle';
      button.setAttribute('aria-label', 'Open menu');
      container.appendChild(button);

      const info = getButtonInfo(button);

      expect(info).toEqual({
        type: 'mega',
        element: button,
        ariaLabel: 'Open menu',
      });
    });

    it('Should return null for non-menu buttons', () => {
      const button = document.createElement('button');
      button.id = 'some-other-button';
      container.appendChild(button);

      const info = getButtonInfo(button);

      expect(info).toBeNull();
    });

    it('Should find mega menu button by closest selector', () => {
      const wrapper = document.createElement('div');
      wrapper.id = 'mega-menu-toggle';
      wrapper.setAttribute('aria-label', 'Open menu');

      const span = document.createElement('span');
      wrapper.appendChild(span);
      container.appendChild(wrapper);

      const info = getButtonInfo(span);

      expect(info).toEqual({
        type: 'mega',
        element: wrapper,
        ariaLabel: 'Open menu',
      });
    });
  });

  describe('isMenuOpenAction', () => {
    it('Should return true for "Dock menu" aria-label', () => {
      expect(isMenuOpenAction('Dock menu')).toBeTruthy();
    });

    it('Should return true for "Open menu" aria-label', () => {
      expect(isMenuOpenAction('Open menu')).toBeTruthy();
    });

    it('Should return false for other aria-labels', () => {
      expect(isMenuOpenAction('Close menu')).toBeFalsy();
      expect(isMenuOpenAction('Undock menu')).toBeFalsy();
      expect(isMenuOpenAction('Some other action')).toBeFalsy();
    });
  });

  describe('isMenuCloseAction', () => {
    it('Should return true for "Undock menu" aria-label', () => {
      expect(isMenuCloseAction('Undock menu')).toBeTruthy();
    });

    it('Should return true for "Close menu" aria-label', () => {
      expect(isMenuCloseAction('Close menu')).toBeTruthy();
    });

    it('Should return false for other aria-labels', () => {
      expect(isMenuCloseAction('Dock menu')).toBeFalsy();
      expect(isMenuCloseAction('Open menu')).toBeFalsy();
      expect(isMenuCloseAction('Some other action')).toBeFalsy();
    });
  });
});

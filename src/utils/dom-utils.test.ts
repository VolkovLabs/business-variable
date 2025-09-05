import {
  createAndInsertElement,
  getNavElementSize,
  findElementByTestId,
  findElementById,
  toggleElementDisplay,
  isElementHidden,
  getAriaLabel,
} from './dom-utils';

describe('domUtils', () => {
  let container: HTMLElement;

  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    value: jest.fn(() => ({
      width: 300,
      height: 200,
      top: 0,
      left: 0,
      bottom: 200,
      right: 300,
    })),
  });

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('createAndInsertElement', () => {
    it('Should create and insert element with beforebegin position', () => {
      const targetElement = document.createElement('div');
      container.appendChild(targetElement);

      const newElement = createAndInsertElement(targetElement, 'beforebegin');

      expect(newElement.tagName).toEqual('DIV');
      expect(targetElement.previousElementSibling).toEqual(newElement);
    });

    it('Should create and append element', () => {
      const targetElement = document.createElement('div');
      container.appendChild(targetElement);

      const newElement = createAndInsertElement(targetElement, 'append');

      expect(newElement.tagName).toEqual('DIV');
      expect(targetElement.children[0]).toEqual(newElement);
    });
  });

  describe('getNavElementSize', () => {
    it('Should return nav element size', () => {
      const nav = document.createElement('nav');
      container.appendChild(nav);

      const size = getNavElementSize(nav);

      expect(size.width).toEqual(300);
      expect(size.height).toEqual(200);
    });
  });

  describe('findElementByTestId', () => {
    it('Should find element by test id', () => {
      const element = document.createElement('div');
      element.setAttribute('data-testid', 'test-element');
      container.appendChild(element);

      const found = findElementByTestId('test-element');

      expect(found).toEqual(element);
    });

    it('Should return null if element not found', () => {
      const found = findElementByTestId('non-existent');

      expect(found).toBeNull();
    });
  });

  describe('findElementById', () => {
    it('Should find element by id', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      container.appendChild(element);

      const found = findElementById('test-element');

      expect(found).toEqual(element);
    });

    it('Should return null if element not found', () => {
      const found = findElementById('non-existent');

      expect(found).toBeNull();
    });
  });

  describe('toggleElementDisplay', () => {
    it('Should set element display style', () => {
      const element = document.createElement('div');
      container.appendChild(element);

      toggleElementDisplay(element, 'none');

      expect(element.style.display).toEqual('none');
    });

    it('Should handle null element gracefully', () => {
      expect(() => toggleElementDisplay(null, 'block')).not.toThrow();
    });
  });

  describe('isElementHidden', () => {
    it('Should return true if element is hidden', () => {
      const element = document.createElement('div');
      element.style.display = 'none';
      container.appendChild(element);

      expect(isElementHidden(element)).toBeTruthy();
    });

    it('Should return false if element is visible', () => {
      const element = document.createElement('div');
      element.style.display = 'block';
      container.appendChild(element);

      expect(isElementHidden(element)).toBeFalsy();
    });
  });

  describe('getAriaLabel', () => {
    it('Should return aria-label value', () => {
      const element = document.createElement('button');
      element.setAttribute('aria-label', 'Test Button');
      container.appendChild(element);

      const ariaLabel = getAriaLabel(element);

      expect(ariaLabel).toEqual('Test Button');
    });

    it('Should return null if aria-label is not set', () => {
      const element = document.createElement('button');
      container.appendChild(element);

      const ariaLabel = getAriaLabel(element);

      expect(ariaLabel).toBeNull();
    });
  });
});

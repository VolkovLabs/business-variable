import { fireEvent, render, screen, within } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { StatusStyleMode } from '../../types';
import { StatusStyleEditor } from './StatusStyleEditor';

/**
 * Props
 */
type Props = React.ComponentProps<typeof StatusStyleEditor>;

describe('StatusStyleEditor', () => {
  /**
   * Change handler
   */
  const onChange = jest.fn();

  /**
   * Selectors
   */
  const getSelectors = getJestSelectors(TEST_IDS.statusStyleEditor);
  const selectors = getSelectors(screen);

  /**
   * Component
   */
  const getComponent = (props: Partial<Props>) => {
    return (
      <StatusStyleEditor
        value={{
          mode: StatusStyleMode.COLOR,
          thresholds: [],
        }}
        onChange={onChange}
        context={{} as any}
        item={{} as any}
        {...props}
      />
    );
  };

  /**
   * Get item
   */
  const getItem = (value: number) => {
    const item = selectors.item(false, value);

    expect(item).toBeInTheDocument();

    return getSelectors(within(item));
  };

  /**
   * Reset mocks
   */
  beforeEach(() => {
    onChange.mockClear();
  });

  it('Should allow to change mode', () => {
    render(
      getComponent({
        value: {
          mode: StatusStyleMode.IMAGE,
          thresholds: [],
        },
      })
    );

    expect(selectors.fieldMode()).toBeInTheDocument();
    expect(selectors.fieldMode()).toHaveValue(StatusStyleMode.IMAGE);

    /**
     * Change value
     */
    fireEvent.change(selectors.fieldMode(), { target: { value: StatusStyleMode.COLOR } });

    expect(onChange).toHaveBeenCalledWith({
      mode: StatusStyleMode.COLOR,
      thresholds: [],
    });
  });

  describe('Image', () => {
    it('Should allow to add item', () => {
      render(
        getComponent({
          value: {
            mode: StatusStyleMode.IMAGE,
            thresholds: [],
          },
        })
      );

      expect(selectors.buttonAddItem()).toBeInTheDocument();

      /**
       * Add item
       */
      fireEvent.click(selectors.buttonAddItem());

      expect(onChange).toHaveBeenCalledWith({
        mode: StatusStyleMode.IMAGE,
        thresholds: [
          {
            value: 0,
            image: '',
          },
        ],
      });
    });

    it('Should allow to add item with next value', () => {
      render(
        getComponent({
          value: {
            mode: StatusStyleMode.IMAGE,
            thresholds: [
              {
                value: 0,
                image: '',
              },
            ],
          },
        })
      );

      expect(selectors.buttonAddItem()).toBeInTheDocument();

      /**
       * Add item
       */
      fireEvent.click(selectors.buttonAddItem());

      expect(onChange).toHaveBeenCalledWith({
        mode: StatusStyleMode.IMAGE,
        thresholds: [
          {
            value: 10,
            image: '',
          },
          {
            value: 0,
            image: '',
          },
        ],
      });
    });

    it('Should allow to change item value and sort items by value', () => {
      render(
        getComponent({
          value: {
            mode: StatusStyleMode.IMAGE,
            thresholds: [
              {
                value: 10,
                image: '',
              },
              {
                value: 0,
                image: '',
              },
              {
                value: -10,
                image: '',
              },
            ],
          },
        })
      );

      const item = getItem(0);

      fireEvent.change(item.fieldValue(), { target: { value: 20 } });
      fireEvent.blur(item.fieldValue(), { target: { value: 20 } });

      expect(onChange).toHaveBeenCalledWith({
        mode: StatusStyleMode.IMAGE,
        thresholds: [
          {
            value: 20,
            image: '',
          },
          {
            value: 10,
            image: '',
          },
          {
            value: -10,
            image: '',
          },
        ],
      });
    });

    it('Should allow to change item image', () => {
      render(
        getComponent({
          value: {
            mode: StatusStyleMode.IMAGE,
            thresholds: [
              {
                value: 10,
                image: '',
              },
              {
                value: 0,
                image: '',
              },
            ],
          },
        })
      );

      const item = getItem(0);

      fireEvent.change(item.fieldUrl(), { target: { value: 'image.png' } });

      expect(onChange).toHaveBeenCalledWith({
        mode: StatusStyleMode.IMAGE,
        thresholds: [
          {
            value: 10,
            image: '',
          },
          {
            value: 0,
            image: 'image.png',
          },
        ],
      });
    });

    it('Should allow to remove item', () => {
      render(
        getComponent({
          value: {
            mode: StatusStyleMode.IMAGE,
            thresholds: [
              {
                value: 10,
                image: '',
              },
              {
                value: 0,
                image: '',
              },
            ],
          },
        })
      );

      const item = getItem(0);

      fireEvent.click(item.buttonRemoveItem());

      expect(onChange).toHaveBeenCalledWith({
        mode: StatusStyleMode.IMAGE,
        thresholds: [
          {
            value: 10,
            image: '',
          },
        ],
      });
    });
  });
});

import { act, render, screen } from '@testing-library/react';
import { getJestSelectors } from '@volkovlabs/jest-selectors';
import React from 'react';

import { TEST_IDS } from '../../../../constants';

import { ToggleDockMenuButtons } from './ToggleDockMenuButtons';

/**
 * Properties
 */
type Props = React.ComponentProps<typeof ToggleDockMenuButtons>;

/**
 * Table Dock Menu Buttons
 */
describe('Table Dock Menu Buttons', () => {
  /**
   * Selectors
   */
  const getSelectors = getJestSelectors({ ...TEST_IDS.toggleDockMenuButtons });
  const selectors = getSelectors(screen);

  /**
   * Get Tested Component
   */
  const getComponent = ({ ...restProps }: Partial<Props>) => {
    return <ToggleDockMenuButtons {...(restProps as any)} />;
  };

  it('Should Render buttons', async () => {
    const dockMenuToggle = jest.fn();
    await act(async () =>
      render(
        getComponent({
          isDockMenuDisplay: true,
          dockMenuToggle: dockMenuToggle,
        })
      )
    );

    expect(selectors.root()).toBeInTheDocument();
  });
});

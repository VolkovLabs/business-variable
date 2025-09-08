import { RadioButtonGroup } from '@grafana/ui';
import React from 'react';

import { TEST_IDS } from '../../../../constants';

interface ToggleDockMenuButtonsProps {
  /**
   * is Classic Dock menu display
   */
  isDockMenuDisplay: boolean;

  /**
   * Dock menu toggle action
   */
  dockMenuToggle: () => void;
}

/**
 * Toggle Dock Menu Buttons
 */
export const ToggleDockMenuButtons = ({ isDockMenuDisplay, dockMenuToggle }: ToggleDockMenuButtonsProps) => {
  return (
    <div {...TEST_IDS.toggleDockMenuButtons.root.apply()}>
      <RadioButtonGroup
        value={isDockMenuDisplay}
        onChange={dockMenuToggle}
        options={[
          {
            value: true,
            icon: 'align-left',
            description: 'Show menu',
            ariaLabel: TEST_IDS.toggleDockMenuButtons.buttonOption.selector('Show menu'),
          },
          {
            value: false,
            icon: 'gf-layout-simple',
            description: 'Show variables',
            ariaLabel: TEST_IDS.toggleDockMenuButtons.buttonOption.selector('Show Variables'),
          },
        ]}
      />
    </div>
  );
};

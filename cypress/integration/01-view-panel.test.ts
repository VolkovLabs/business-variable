import { e2e } from '@grafana/e2e';
import { TestIds } from '../../src/constants';

/**
 * Dashboard
 */
const json = require('../../provisioning/dashboards/panels.json');
const testedPanel = json.panels[0];

/**
 * Selector
 */
const getTestIdSelector = (testId: string) => `[data-testid="${testId}"]`;

/**
 * Panel
 */
describe('Viewing an Abc panel', () => {
  beforeEach(() => {
    e2e.flows.openDashboard({
      uid: json.uid,
    });
  });

  it('Should display a Hello World', () => {
    const currentPanel = e2e.components.Panels.Panel.title(testedPanel.title);
    currentPanel.should('be.visible');

    /**
     * Root
     */
    const chart = currentPanel.find(getTestIdSelector(TestIds.panel.root));
    chart.should('be.visible');

    /**
     * Screenshot
     */
    chart.screenshot(testedPanel.title);
    e2e().compareScreenshots({ name: testedPanel.title, threshold: 0.05 });
  });
});

import { test, expect } from '@grafana/plugin-e2e';
import { PanelHelper, UrlHelper } from './utils';

test.describe('Volkovlabs Variable Panel', () => {
  test('Check grafana version', async ({ grafanaVersion }) => {
    console.log('Grafana version: ', grafanaVersion);
    expect(grafanaVersion).toEqual(grafanaVersion);
  });

  test('Should add new empty variable panel', async ({ gotoDashboardPage, readProvisionedDashboard, page }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    /**
     * Await content load
     */
    await page.waitForTimeout(1500);

    /**
     * Add new visualization
     */
    const editPage = await dashboardPage.addPanel();
    await editPage.setVisualization('Business Variable');
    await editPage.setPanelTitle('New Panel');

    /**
     * Apply changes and return to dashboard
     */
    await editPage.backToDashboard();

    /**
     * Check Presence
     */
    const panel = new PanelHelper(dashboardPage, 'New Panel');
    const tableView = panel.getTableView();
    await tableView.checkPresence();
    await tableView.checkAlert();
    await panel.checkIfNoErrors();
  });

  test('Should display Device Variable content', async ({ gotoDashboardPage, readProvisionedDashboard, page }) => {
    /**
     * Go To Panels dashboard panels.json
     * return dashboardPage
     */
    const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
    const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

    /**
     * Await content load
     */
    await page.waitForTimeout(1500);

    /**
     * Check Presence
     */
    const panel = new PanelHelper(dashboardPage, 'Device Simple');
    const tableView = panel.getTableView();
    await tableView.checkPresence();

    const table = tableView.getTable();
    await table.getRow(0).getCell('All', 0).checkPresence();
    await table.getRow(1).getCell('Device1', 0).checkText('Device1');
    await table.getRow(2).getCell('Device2', 0).checkText('Device2');
    await table.getRow(3).getCell('Device3', 0).checkText('Device3');
    await table.getRow(4).getCell('Device4', 0).checkText('Device4');
    await table.getRow(5).getCell('Device5', 0).checkText('Device5');
    await table.getRow(6).getCell('Device6', 0).checkText('Device6');
    await table.getRow(7).getCell('Device7', 0).checkText('Device7');
  });

  test.describe('Minimize view', () => {
    test('Should change variable value using minimize view', async ({
      gotoDashboardPage,
      readProvisionedDashboard,
      page,
    }) => {
      /**
       * Go To Panels dashboard home.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'home.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      const panel = new PanelHelper(dashboardPage, 'Minimize');
      const minimizeView = panel.getMinimizeView();
      await minimizeView.checkPresence();
      /**
       * Change variable value
       */
      minimizeView.getTextInput().changeInputValue('test');
      await page.waitForTimeout(400);
      const urlParams = new UrlHelper(await page.url());
      urlParams.checkVariable('var-text', 'test');
    });
    test('Should change variable value using minimize view and select', async ({
      gotoDashboardPage,
      readProvisionedDashboard,
      page,
    }) => {
      /**
       * Go To Panels dashboard home.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      const panel = new PanelHelper(dashboardPage, 'Minimize');
      const minimizeView = panel.getMinimizeView();
      await minimizeView.checkPresence();
      /**
       * Change variable value
       */
      await panel.getMinimizeView().getSelect().checkPresence();
      await minimizeView.getSelect().changeValue(dashboardPage, 'myKey');
      await page.waitForTimeout(200);
      const urlParams = new UrlHelper(await page.url());
      urlParams.checkVariable('var-test', 'myvalue');
    });
  });

  test.describe('Slider View', () => {
    test('Should display Alert Info if variable not specified in Slider view', async ({
      gotoDashboardPage,
      readProvisionedDashboard,
      page,
    }) => {
      /**
       * Go To Panels dashboard panels.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'sliders.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });

      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      const panel = new PanelHelper(dashboardPage, 'Empty');
      const sliderPanel = panel.getSliderView();
      await sliderPanel.checkVariableAlert();
    });
  });

  test.describe('Button view', () => {
    test('Should change variable value using button view', async ({
      gotoDashboardPage,
      readProvisionedDashboard,
      page,
    }) => {
      /**
       * Go To Panels dashboard panels.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      /**
       * Check Presence
       */
      const panel = new PanelHelper(dashboardPage, 'Device 1 Multi + All');
      const buttonView = panel.getButtonView();
      await buttonView.checkPresence();
      const button = await buttonView.getButton('Device4');
      await expect(button).toBeVisible();
      await buttonView.clickOnButton('Device4');
      await page.waitForTimeout(300);
      /**
       * Check variable values
       */
      const urlParams = new UrlHelper(await page.url());
      urlParams.checkVariable('var-device', 'Device4');
    });

    test('Should Reset variable values to initial state', async ({
      gotoDashboardPage,
      readProvisionedDashboard,
      page,
    }) => {
      /**
       * Go To Panels dashboard panels.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      /**
       * Check Presence
       */
      const panel = new PanelHelper(dashboardPage, 'Device 1 Multi + All');
      const buttonView = panel.getButtonView();
      await buttonView.checkPresence();
      const button = await buttonView.getButton('Device3');
      await expect(button).toBeVisible();
      await buttonView.clickOnButton('Device3');
      await page.waitForTimeout(200);
      /**
       * Check variable values
       */
      const urlParams = new UrlHelper(await page.url());
      urlParams.checkVariable('var-device', 'Device3');
      await buttonView.clickOnResetButton();
      await page.waitForTimeout(200);
      urlParams.updateParams(await page.url());
      urlParams.checkIfNoVariableValue('var-device', 'Device3');
    });
  });

  test.describe('Table view', () => {
    test('Should display Alert Info if variable not specified in Table View', async ({
      gotoDashboardPage,
      readProvisionedDashboard,
      page,
    }) => {
      /**
       * Go To Panels dashboard panels.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'panels.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      const panel = new PanelHelper(dashboardPage, 'Empty');
      const tableView = panel.getTableView();
      await tableView.checkPresence();
      await tableView.checkAlert();
    });

    test('Should display All option if variable include-all', async ({
      gotoDashboardPage,
      readProvisionedDashboard,
      page,
    }) => {
      /**
       * Go To Panels dashboard home.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'home.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      const panel = new PanelHelper(dashboardPage, 'City variable');
      const tableView = panel.getTableView();
      await tableView.checkPresence();
      await tableView.getTable().getRow(0).getCell('All', 0).checkPresence();
      await tableView.getTable().checkBodyRowsCount(6);
    });

    test('Should display tree cells in depth', async ({ gotoDashboardPage, readProvisionedDashboard, page }) => {
      /**
       * Go To Panels dashboard home.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'home.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      const panel = new PanelHelper(dashboardPage, 'Metrics');
      const tableView = panel.getTableView();
      await tableView.checkPresence();

      /**
       * Check row and cells in 4 level
       */
      await tableView.getTable().getRow('0.0.0.0').checkPresence();
      await tableView.getTable().getRow('0.0.0.0').getCell('NY Central 133', 3).checkPresence();
      await tableView.getTable().getRow('0.0.0.0').getCell('NY Central 133', 3).checkText('NY Central 133');
    });

    test('Should expand all rows', async ({ gotoDashboardPage, readProvisionedDashboard, page }) => {
      /**
       * Go To Panels dashboard home.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'performance10k.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      const panel = new PanelHelper(dashboardPage, 'Tree View Updated');
      const tableView = panel.getTableView();
      await tableView.checkPresence();

      await tableView.getTable().checkBodyRowsCount(21);
      await panel.getTableView().getTableHeader().expandAll();
      await tableView.getTable().checkBodyRowsCount(9);
      await panel.getTableView().getTableHeader().expandAll();
      await tableView.getTable().checkBodyRowsCount(21);
    });

    test('Should set variable using tree view', async ({ gotoDashboardPage, readProvisionedDashboard, page }) => {
      /**
       * Go To Panels dashboard home.json
       * return dashboardPage
       */
      const dashboard = await readProvisionedDashboard({ fileName: 'home.json' });
      const dashboardPage = await gotoDashboardPage({ uid: dashboard.uid });
      /**
       * Await content load
       */
      await page.waitForTimeout(1500);
      const panel = new PanelHelper(dashboardPage, 'City variable');
      const tableView = panel.getTableView();
      await tableView.checkPresence();

      await tableView.getTable().getRow(1).checkPresence();
      await tableView.getTable().getRow(1).checkControl();
      await tableView.getTable().getRow(1).toggleValue();

      await page.waitForTimeout(200);

      const urlParams = new UrlHelper(await page.url());
      urlParams.checkVariable('var-city', 'Moscow');

      await tableView.getTable().getRow(0).checkPresence();
      await tableView.getTable().getRow(0).checkControl();
      await tableView.getTable().getRow(0).toggleValue();
      await page.waitForTimeout(200);
      urlParams.updateParams(await page.url());
      urlParams.checkIfNoVariableValue('var-city', 'Moscow');
    });
  });
});

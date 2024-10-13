import { Locator } from '@playwright/test';
import { DashboardPage, expect, Panel, PanelEditPage } from '@grafana/plugin-e2e';
import { TEST_IDS } from '../../src/constants/tests';
import { getLocatorSelectors, LocatorSelectors } from './selectors';

const getTablePanelSelectors = getLocatorSelectors(TEST_IDS.tableView);
const getTableSelectors = getLocatorSelectors(TEST_IDS.table);
const getButtonSelectors = getLocatorSelectors(TEST_IDS.buttonView);
const getMinimizeSelectors = getLocatorSelectors(TEST_IDS.minimizeView);
const getSliderSelectors = getLocatorSelectors(TEST_IDS.sliderView);
const getTextSelectors = getLocatorSelectors(TEST_IDS.textVariable);
const getOptionsSelectors = getLocatorSelectors(TEST_IDS.optionsVariable);

/**
 * Table Cell Helper
 */
class TableCellHelper {
  private readonly locator: Locator;
  private readonly value: string;
  private readonly depth: number;

  constructor(
    value: string,
    depth: number,
    parentSelectors: LocatorSelectors<Pick<typeof TEST_IDS.table, 'row' | 'cell'>>
  ) {
    this.value = value;
    this.depth = depth;
    this.locator = parentSelectors.cell(this.value, this.depth);
  }

  private getMsg(message: string): string {
    return `TableCell: ${message}`;
  }

  public get() {
    return this.locator;
  }

  public async checkPresence() {
    return expect(this.get(), this.getMsg('Check Presence')).toBeVisible();
  }

  public async checkText(text: string) {
    return expect(this.get(), this.getMsg('Check Text')).toHaveText(text);
  }
}

/**
 * Table Row Helper
 */
class TableRowHelper {
  private readonly selectors: LocatorSelectors<Pick<typeof TEST_IDS.table, 'row' | 'cell' | 'control'>>;

  constructor(
    private readonly locator: Locator,
    public readonly id: number | string
  ) {
    this.selectors = getTableSelectors(this.locator);
  }

  private getMsg(message: string): string {
    return `TableRow: ${message}`;
  }

  public get() {
    return this.locator;
  }

  public getCell(value: string, depth: number): TableCellHelper {
    return new TableCellHelper(value, depth, this.selectors);
  }

  public async checkPresence() {
    return expect(this.get(), this.getMsg('Check Table Row Presence')).toBeVisible();
  }

  public async checkIfNotPresence() {
    return expect(this.get(), this.getMsg('Check If Not Presence')).not.toBeVisible();
  }

  public async checkControl() {
    return expect(this.get().getByTestId(TEST_IDS.table.control), this.getMsg('Check Control')).toBeVisible();
  }

  public async toggleValue() {
    await this.get().getByTestId(TEST_IDS.table.control).click();
  }
}

/**
 * Table panel Helper
 */
class TableHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.table>;

  constructor(public readonly locator: Locator) {
    this.selectors = this.getSelectors(locator);
  }

  private getSelectors(locator: Locator) {
    return getTableSelectors(locator);
  }

  private getMsg(message: string): string {
    return `TableBody: ${message}`;
  }

  public getRow(rowId: number | string): TableRowHelper {
    const locator = this.selectors.row(rowId);
    return new TableRowHelper(locator, rowId);
  }

  public async checkBodyRowsCount(count: number) {
    const rows = await this.locator.locator('tbody').locator('tr').all();

    expect(rows, this.getMsg('Check Body Rows Count')).toHaveLength(count);
  }
}

/**
 * Table panel Helper
 */
class TableHeaderHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.table>;

  constructor(public readonly locator: Locator) {
    this.selectors = this.getSelectors(locator);
  }

  private getSelectors(locator: Locator) {
    return getTableSelectors(locator);
  }

  private getMsg(message: string): string {
    return `TableHeader: ${message}`;
  }

  public get() {
    return this.locator;
  }

  public async checkPresence() {
    return expect(this.get(), this.getMsg('Check Table Header Presence')).toBeVisible();
  }

  public async expandAll() {
    await this.selectors.buttonExpandAll().click();
  }
}

/**
 * Table panel Helper
 */
class TablePanelHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.tableView>;

  constructor(public readonly locator: Locator) {
    this.selectors = this.getSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Table: ${msg}`;
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Panel Presence')).toBeVisible();
  }

  public async checkAlert() {
    return expect(this.selectors.infoMessage()).toBeVisible();
  }

  private getSelectors(locator: Locator) {
    return getTablePanelSelectors(locator);
  }

  public getTable() {
    return new TableHelper(this.locator);
  }

  public getTableHeader() {
    return new TableHeaderHelper(this.locator);
  }
}

/**
 * Button View Helper
 */
class ButtonPanelHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.buttonView>;

  constructor(public readonly locator: Locator) {
    this.selectors = this.getSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Button: ${msg}`;
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Button Panel Presence')).toBeVisible();
  }

  private getSelectors(locator: Locator) {
    return getButtonSelectors(locator);
  }

  public getButton(value: string) {
    const locator = this.selectors.item(value);
    return locator;
  }

  public clickOnButton(value: string) {
    this.selectors.item(value).click();
  }

  public clickOnResetButton() {
    this.selectors.resetVariable().click();
  }
}

/**
 * Text Variable Helper
 */
class TextVariableHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.textVariable>;

  constructor(public readonly locator: Locator) {
    this.selectors = this.getTextSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Text: ${msg}`;
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Text Variable Presence')).toBeVisible();
  }

  private getTextSelectors(locator: Locator) {
    return getTextSelectors(locator);
  }

  public changeInputValue(value: string) {
    this.selectors.root().fill(value);
    this.selectors.root().blur();
  }
}

/**
 * Text Variable Helper
 */
class SelectVariableHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.optionsVariable>;

  constructor(public readonly locator: Locator) {
    this.selectors = this.getSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Select: ${msg}`;
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Select Presence')).toBeVisible();
  }

  private getSelectors(locator: Locator) {
    return getOptionsSelectors(locator);
  }

  public async changeValue(dashboardPage: DashboardPage, value: string) {
    this.selectors.root().click();
    await dashboardPage
      .getByGrafanaSelector(dashboardPage.ctx.selectors.components.Select.option)
      .getByText(value)
      .click();
    this.selectors.root().blur();
  }
}

/**
 * Minimize View Helper
 */
class MinimizePanelHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.minimizeView>;
  public textSelectors: LocatorSelectors<typeof TEST_IDS.textVariable>;

  constructor(public readonly locator: Locator) {
    this.selectors = this.getSelectors(locator);
    this.textSelectors = this.getTextSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Minimize: ${msg}`;
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Minimize view Presence')).toBeVisible();
  }

  private getSelectors(locator: Locator) {
    return getMinimizeSelectors(locator);
  }

  private getTextSelectors(locator: Locator) {
    return getTextSelectors(locator);
  }

  public getTextInput() {
    return new TextVariableHelper(this.locator);
  }

  public getSelect() {
    return new SelectVariableHelper(this.locator);
  }
}

/**
 * Slider view Helper
 */
class SliderPanelHelper {
  public selectors: LocatorSelectors<typeof TEST_IDS.sliderView>;

  constructor(public readonly locator: Locator) {
    this.selectors = this.getSelectors(locator);
  }

  private getMsg(msg: string): string {
    return `Slider: ${msg}`;
  }

  public async checkPresence() {
    return expect(this.selectors.root(), this.getMsg('Check Slider Presence')).toBeVisible();
  }

  private getSelectors(locator: Locator) {
    return getSliderSelectors(locator);
  }

  public async checkVariableAlert() {
    return expect(this.selectors.noVariableMessage()).toBeVisible();
  }
}

/**
 * Panel Helper
 */
export class PanelHelper {
  private readonly locator: Locator;
  private readonly panel: Panel;

  constructor(dashboardPage: DashboardPage, panelTitle: string) {
    this.panel = dashboardPage.getPanelByTitle(panelTitle);
    this.locator = this.panel.locator;
  }

  private getMsg(msg: string): string {
    return `Panel: ${msg}`;
  }

  public getTablePanel() {
    return new TablePanelHelper(this.locator);
  }

  public getSliderPanel() {
    return new SliderPanelHelper(this.locator);
  }

  public getButtonPanel() {
    return new ButtonPanelHelper(this.locator);
  }

  public getMinimizePanel() {
    return new MinimizePanelHelper(this.locator);
  }

  public async checkIfNoErrors() {
    return expect(this.panel.getErrorIcon(), this.getMsg('Check If No Errors')).not.toBeVisible();
  }
}

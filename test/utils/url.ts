import { expect } from '@grafana/plugin-e2e';

/**
 * Url params Helper
 */
export class UrlHelper {
  public params: URLSearchParams;

  constructor(url: string) {
    this.params = new URLSearchParams(url);
  }

  public getParam(name: string) {
    return this.params.get(name);
  }

  public checkVariable(name: string, value: string) {
    const param = this.params.getAll(name);
    expect(param).toContainEqual(value);
  }

  public checkIfNoVariableValue(name: string, value: string) {
    const param = this.params.getAll(name);
    expect(param).not.toContainEqual(value);
  }

  public updateParams(url: string) {
    this.params = new URLSearchParams(url);
  }
}

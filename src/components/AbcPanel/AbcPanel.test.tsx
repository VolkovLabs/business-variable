import React from 'react';
import { toDataFrame } from '@grafana/data';
import { render, screen } from '@testing-library/react';
import { TestIds } from '../../constants';
import { AbcPanel } from './AbcPanel';

/**
 * Test Scenario
 */
enum Scenario {
  NoField = 'noField',
  SimpleField = 'simpleField',
}

/**
 * Panel
 */
describe('Panel', () => {
  /**
   * Get Test Data
   */
  const getTestData = (scenario: Scenario) => {
    switch (scenario) {
      case Scenario.SimpleField: {
        return {
          series: [
            toDataFrame({
              name: 'data',
              refId: 'A',
              fields: [
                {
                  name: 'data',
                  type: 'string',
                  values: ['Hello World!'],
                },
              ],
            }),
          ],
        };
      }
      default: {
        return {
          series: [
            toDataFrame({
              name: 'data',
              fields: [],
            }),
          ],
        };
      }
    }
  };

  /**
   * Get Tested Component
   */
  const getComponent = ({ options = { name: 'data' }, ...restProps }: any, scenario: Scenario = Scenario.NoField) => {
    return <AbcPanel data={getTestData(scenario)} {...restProps} options={options} />;
  };

  it('Should find component', async () => {
    render(getComponent({}));
    expect(screen.getByTestId(TestIds.panel.root)).toBeInTheDocument();
  });

  it('Should get the latest value', async () => {
    render(getComponent({}, Scenario.SimpleField));

    expect(screen.getByTestId(TestIds.panel.root)).toBeInTheDocument();
    expect(screen.getByText('Hello World!')).toBeInTheDocument();
  });
});

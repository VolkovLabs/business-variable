import React from 'react';
import { toDataFrame } from '@grafana/data';
import { Select } from '@grafana/ui';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { TestIds } from '../../constants';
import { FieldsEditor } from './FieldsEditor';

/**
 * Mock @grafana/ui
 */
jest.mock('@grafana/ui', () => ({
  ...jest.requireActual('@grafana/ui'),
  /**
   * Mock Select component
   */
  Select: jest.fn().mockImplementation(({ options, onChange, value, ...restProps }) => (
    <select
      onChange={(event: any) => {
        if (onChange) {
          onChange(options.find((option: any) => option.value === event.target.value));
        }
      }}
      /**
       * Fix jest warnings because null value.
       * For Select component in @grafana/ui should be used null to reset value.
       */
      value={value === null ? '' : value}
      {...restProps}
    >
      {options.map(({ label, value }: any) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )),
}));

/**
 * Props
 */
type Props = React.ComponentProps<typeof FieldsEditor>;

describe('FieldsEditor', () => {
  /**
   * Get Tested Component
   * @param props
   */
  const getComponent = (props: Partial<Props>) => <FieldsEditor {...(props as any)} />;

  const dataFrameA = toDataFrame({
    fields: [
      {
        name: 'field1',
      },
      {
        name: 'field2',
      },
    ],
    refId: 'A',
  });

  const dataFrameB = toDataFrame({
    fields: [
      {
        name: 'fieldB1',
      },
      {
        name: 'fieldB2',
      },
    ],
    refId: 'B',
  });

  it('Should render levels', () => {
    render(
      getComponent({
        context: {
          data: [dataFrameA],
          options: {
            levels: [
              {
                name: 'field1',
                source: 'A',
              },
              {
                name: 'field2',
                source: 'A',
              },
            ],
          } as any,
        } as any,
      })
    );

    expect(screen.getByTestId(TestIds.fieldsEditor.level('field1'))).toBeInTheDocument();
    expect(screen.getByTestId(TestIds.fieldsEditor.level('field2'))).toBeInTheDocument();
  });

  it('Should allow select any fields', () => {
    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            levels: [],
          } as any,
        } as any,
      })
    );

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          {
            value: 'A:field1',
            source: 'A',
            fieldName: 'field1',
            label: 'A:field1',
          },
          {
            value: 'A:field2',
            source: 'A',
            fieldName: 'field2',
            label: 'A:field2',
          },
          {
            value: 'B:fieldB1',
            source: 'B',
            fieldName: 'fieldB1',
            label: 'B:fieldB1',
          },
          {
            value: 'B:fieldB2',
            source: 'B',
            fieldName: 'fieldB2',
            label: 'B:fieldB2',
          },
        ],
      }),
      expect.anything()
    );
  });

  it('Should allow select fields only from the current data frame', () => {
    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            levels: [
              {
                name: 'field1',
                source: 'A',
              },
            ],
          } as any,
        } as any,
      })
    );

    expect(Select).toHaveBeenCalledWith(
      expect.objectContaining({
        options: [
          {
            value: 'field2',
            source: 'A',
            fieldName: 'field2',
            label: 'field2',
          },
        ],
      }),
      expect.anything()
    );
  });

  it('Should add new level', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            levels: [
              {
                name: 'field1',
                source: 'A',
              },
            ],
          } as any,
        } as any,
        onChange,
      })
    );

    await act(() =>
      fireEvent.change(screen.getByLabelText(TestIds.fieldsEditor.newLevelField), { target: { value: 'field2' } })
    );

    expect(screen.getByTestId(TestIds.fieldsEditor.buttonAddNew)).toBeInTheDocument();
    expect(screen.getByTestId(TestIds.fieldsEditor.buttonAddNew)).not.toBeDisabled();

    await act(() => fireEvent.click(screen.getByTestId(TestIds.fieldsEditor.buttonAddNew)));

    expect(onChange).toHaveBeenCalledWith([
      { name: 'field1', source: 'A' },
      { name: 'field2', source: 'A' },
    ]);
  });

  it('Should remove level', async () => {
    const onChange = jest.fn();

    render(
      getComponent({
        context: {
          data: [dataFrameA, dataFrameB],
          options: {
            levels: [
              {
                name: 'field1',
                source: 'A',
              },
              {
                name: 'field2',
                source: 'A',
              },
            ],
          } as any,
        } as any,
        onChange,
      })
    );

    const field2 = screen.getByTestId(TestIds.fieldsEditor.level('field2'));

    /**
     * Check field presence
     */
    expect(field2).toBeInTheDocument();

    /**
     * Remove
     */
    await act(() => fireEvent.click(within(field2).getByTestId(TestIds.fieldsEditor.buttonRemove)));

    expect(onChange).toHaveBeenCalledWith([{ name: 'field1', source: 'A' }]);
  });
});

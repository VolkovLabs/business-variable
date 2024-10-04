import { DateTime, dateTime } from '@grafana/data';
import React from 'react';

const actual = jest.requireActual('@grafana/ui');

/**
 * Mock DatetimePicker component
 */
const DateTimePickerMock = ({ onChange, date, ...restProps }: any) => {
  return (
    <input
      data-testid={restProps['data-testid']}
      value={(date as DateTime).toString()}
      onChange={(event) => {
        if (onChange) {
          onChange(dateTime(event.target.value));
        }
      }}
    />
  );
};

const DateTimePicker = jest.fn(DateTimePickerMock);

/**
 * Mock Select component
 */
const SelectMock = ({ options, onChange, value, isMulti, ...restProps }: any) => {
  const selectProps: any = {};

  if (restProps['aria-label']) {
    selectProps['aria-label'] = restProps['aria-label'];
  }

  return (
    <select
      onChange={(event: any) => {
        if (onChange) {
          if (isMulti) {
            onChange(options.filter((option: any) => event.target.values.includes(option.value)));
          } else {
            onChange(options.find((option: any) => option.value === event.target.value));
          }
        }
      }}
      /**
       * Fix jest warnings because null value.
       * For Select component in @grafana/ui should be used null to reset value.
       */
      value={value === null ? '' : value}
      multiple={isMulti}
      {...selectProps}
    >
      {options.map(({ label, value }: any) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
};

const Select = jest.fn(SelectMock);

/**
 * Mock Button Row Toolbar
 */
const ToolbarButtonRowMock = ({ leftItems, children }: any) => {
  return (
    <>
      {leftItems}
      {children}
    </>
  );
};

const ToolbarButtonRow = jest.fn(ToolbarButtonRowMock);

/**
 * Set mocks
 */
beforeEach(() => {
  Select.mockImplementation(SelectMock);
  DateTimePicker.mockImplementation(DateTimePickerMock);
  ToolbarButtonRow.mockImplementation(ToolbarButtonRowMock);
});

module.exports = {
  ...actual,
  ToolbarButtonRow,
  Select,
  DateTimePicker,
};

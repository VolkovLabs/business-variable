import React from 'react';

const actual = jest.requireActual('@grafana/ui');

/**
 * Mock Select component
 */
const Select = jest.fn(({ options, onChange, value, isMulti, ...restProps }) => {
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
});

/**
 * Mock Button Row Toolbar
 */
const ToolbarButtonRow = jest.fn(({ leftItems, children }) => {
  return (
    <>
      {leftItems}
      {children}
    </>
  );
});

module.exports = {
  ...actual,
  ToolbarButtonRow,
  Select,
};

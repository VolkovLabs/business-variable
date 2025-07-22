import { TEST_IDS } from 'constants/tests';
import React from 'react';

const actual = jest.requireActual('@volkovlabs/components');

/**
 * Mock Slider
 */
const SliderMock: React.FC<any> = ({ onChange, value, onAfterChange }) => {
  return (
    <input
      type="range"
      onChange={(event) => {
        if (onChange) {
          onChange(Number(event.target.value));
        }
      }}
      onBlur={(event) => {
        if (onAfterChange) {
          onAfterChange(Number(event.target.value));
        }
      }}
      data-testid={TEST_IDS.sliderView.slider}
      value={value}
    />
  );
};

const Slider = jest.fn(SliderMock);

/**
 * Mock DatasourcePayloadEditor
 */
const DatasourcePayloadEditorMock = ({ onChange, ...restProps }: any) => {
  return (
    <>
      <input
        data-testid="data-testid query-editor"
        value={restProps.value}
        onChange={(event) => {
          if (onChange) {
            onChange(event.target.value);
          }
        }}
      />
      <span data-testid="data-testid datasourceUID-key">{restProps.datasourceUid}</span>
    </>
  );
};

const DatasourcePayloadEditor = jest.fn(DatasourcePayloadEditorMock);

/**
 * Mock useDatasourceRequest hook
 */
const useDatasourceRequest = jest.fn();

/**
 * Set mocks
 */
beforeEach(() => {
  DatasourcePayloadEditor.mockImplementation(DatasourcePayloadEditorMock);
  Slider.mockImplementation(SliderMock);
});

module.exports = {
  ...actual,
  Slider,
  DatasourcePayloadEditor,
  useDatasourceRequest,
};

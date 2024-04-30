import { TEST_IDS } from 'constants/tests';
import React from 'react';

const actual = jest.requireActual('@volkovlabs/components');

/**
 * Mock Slider
 */
const Slider: React.FC<any> = ({ onChange, value }) => {
  return (
    <input
      type="range"
      onChange={(event) => {
        if (onChange) {
          onChange(Number(event.target.value));
        }
      }}
      data-testid={TEST_IDS.sliderView.slider}
      value={value}
    />
  );
};

export default Slider;

module.exports = {
  ...actual,
  Slider,
};

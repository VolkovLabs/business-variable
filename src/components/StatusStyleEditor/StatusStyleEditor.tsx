import { StandardEditorProps } from '@grafana/data';
import { Button, ButtonGroup, InlineField, InlineFieldRow, Input, Select, useStyles2 } from '@grafana/ui';
import { NumberInput } from '@volkovlabs/components';
import React from 'react';

import { TEST_IDS } from '../../constants';
import { PanelOptions, StatusStyleMode, StatusStyleOptions } from '../../types';
import { getStyles } from './StatusStyleEditor.styles';

/**
 * Properties
 */
interface Props extends StandardEditorProps<StatusStyleOptions, null, PanelOptions> {}

/**
 * Status Style Editor
 */
export const StatusStyleEditor: React.FC<Props> = ({ value, onChange }) => {
  /**
   * Styles
   */
  const styles = useStyles2(getStyles);

  return (
    <div>
      <InlineField label="Mode" grow={true}>
        <Select
          options={[
            {
              label: 'Color',
              value: StatusStyleMode.COLOR,
              icon: 'circle-mono',
            },
            {
              label: 'Image',
              value: StatusStyleMode.IMAGE,
              icon: 'gf-portrait',
            },
          ]}
          value={value.mode}
          onChange={(event) => {
            onChange({
              ...value,
              mode: event?.value ?? value.mode,
            });
          }}
          aria-label={TEST_IDS.statusStyleEditor.fieldMode}
        />
      </InlineField>
      {value.mode === StatusStyleMode.IMAGE && (
        <div>
          <ButtonGroup className={styles.buttons}>
            <Button
              icon="plus"
              variant="secondary"
              fullWidth={true}
              onClick={() =>
                onChange({
                  ...value,
                  thresholds: [
                    {
                      value: value.thresholds[0] ? value.thresholds[0].value + 10 : 0,
                      image: '',
                    },
                    ...value.thresholds,
                  ],
                })
              }
              size="sm"
              data-testid={TEST_IDS.statusStyleEditor.buttonAddItem}
            >
              Add threshold
            </Button>
          </ButtonGroup>
          {value.thresholds.map((threshold, index) => (
            <InlineFieldRow key={index} data-testid={TEST_IDS.statusStyleEditor.item(threshold.value)}>
              <InlineField label="Value" shrink={true}>
                <NumberInput
                  width={8}
                  min={-Infinity}
                  value={threshold.value}
                  onChange={(thresholdValue) => {
                    const updatedThresholds = value.thresholds.map((item, itemIndex) =>
                      itemIndex === index
                        ? {
                            ...item,
                            value: thresholdValue,
                          }
                        : item
                    );

                    /**
                     * Sort items from high to low value
                     */
                    updatedThresholds.sort((a, b) => (a.value > b.value ? -1 : 1));

                    onChange({
                      ...value,
                      thresholds: updatedThresholds,
                    });
                  }}
                  data-testid={TEST_IDS.statusStyleEditor.fieldValue}
                />
              </InlineField>
              <InlineField label="URL" grow={true}>
                <Input
                  value={threshold.image}
                  onChange={(event) => {
                    onChange({
                      ...value,
                      thresholds: value.thresholds.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              image: event.currentTarget.value,
                            }
                          : item
                      ),
                    });
                  }}
                  suffix={<img src={threshold.image} alt="" style={{ width: 16 }} />}
                  data-testid={TEST_IDS.statusStyleEditor.fieldUrl}
                />
              </InlineField>
              <Button
                icon="trash-alt"
                variant="secondary"
                onClick={() =>
                  onChange({
                    ...value,
                    thresholds: value.thresholds.filter((item, itemIndex) => itemIndex !== index),
                  })
                }
                tooltip="Remove threshold"
                data-testid={TEST_IDS.statusStyleEditor.buttonRemoveItem}
              />
            </InlineFieldRow>
          ))}
        </div>
      )}
    </div>
  );
};

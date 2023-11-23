import { cx } from '@emotion/css';
import { DataFrame, SelectableValue } from '@grafana/data';
import { Button, Icon, IconButton, InlineField, InlineFieldRow, Select, useTheme2 } from '@grafana/ui';
import React, { useCallback, useMemo, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggingStyle,
  Droppable,
  DropResult,
  NotDraggingStyle,
} from 'react-beautiful-dnd';

import { TEST_IDS } from '../../constants';
import { Level, LevelsGroup } from '../../types';
import { reorder } from '../../utils';
import { getStyles } from './LevelsEditor.styles';

/**
 * Get Item Style
 */
const getItemStyle = (
  isDragging: boolean,
  draggableStyle: DraggingStyle | NotDraggingStyle | undefined,
  index: number
) => ({
  marginLeft: index * 4,
  /**
   * styles we need to apply on draggables
   */
  ...draggableStyle,
});

/**
 * Properties
 */
interface Props extends LevelsGroup {
  /**
   * On Change
   * @param item
   */
  onChange: (item: LevelsGroup) => void;

  /**
   * Data
   */
  data: DataFrame[];
}

/**
 * Levels Editor
 * @constructor
 */
export const LevelsEditor: React.FC<Props> = ({ items: groupLevels, name, onChange, data }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = getStyles(theme);

  /**
   * States
   */
  const [items, setItems] = useState(groupLevels);
  const [newLevel, setNewLevel] = useState<(Level & { value: string }) | null>(null);

  /**
   * Change Items
   */
  const onChangeItems = useCallback(
    (items: Level[]) => {
      setItems(items);
      onChange({
        name,
        items,
      });
    },
    [name, onChange]
  );

  /**
   * Drag End
   */
  const onDragEnd = useCallback(
    (result: DropResult) => {
      /**
       * Dropped outside the list
       */
      if (!result.destination) {
        return;
      }

      onChangeItems(reorder(items, result.source.index, result.destination.index));
    },
    [items, onChangeItems]
  );

  /**
   * Available Field Options
   */
  const availableFieldOptions = useMemo(() => {
    const nameField = items[items.length - 1];

    if (nameField) {
      const dataFrameIndex = data.findIndex((dataFrame, index) =>
        dataFrame.refId === undefined ? index === nameField.source : dataFrame.refId === nameField.source
      );
      const dataFrame = data[dataFrameIndex];

      if (dataFrame) {
        return (
          dataFrame.fields
            .map(({ name }) => ({
              label: name,
              source: dataFrame.refId ?? dataFrameIndex,
              value: name,
              fieldName: name,
            }))
            .filter((option) => !items.some((item) => item.name === option.value)) || []
        );
      }
    }

    return data.reduce((acc: SelectableValue[], dataFrame, index) => {
      return acc.concat(
        dataFrame.fields.map((field) => {
          const source = dataFrame.refId || index;

          return {
            value: `${source}:${field.name}`,
            fieldName: field.name,
            label: `${source}:${field.name}`,
            source,
          };
        })
      );
    }, []);
  }, [data, items]);

  /**
   * Add New Level
   */
  const onAddNewLevel = useCallback(() => {
    if (newLevel) {
      onChangeItems([
        ...items,
        {
          name: newLevel.name,
          source: newLevel.source,
        },
      ]);
      setNewLevel(null);
    }
  }, [items, newLevel, onChangeItems]);

  return (
    <div data-testid={TEST_IDS.levelsEditor.root}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={name}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.name} draggableId={item.name} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style, index)}
                      className={styles.item}
                      data-testid={TEST_IDS.levelsEditor.item(item.name)}
                    >
                      <div className={styles.header}>
                        <div className={styles.column}>
                          {item.name && (
                            <div className={styles.titleWrapper}>
                              <div className={cx(styles.title)}>{item.name}</div>
                            </div>
                          )}
                        </div>

                        <div className={styles.column}>
                          <IconButton
                            name="trash-alt"
                            onClick={() => onChangeItems(items.filter((field) => field.name !== item.name))}
                            aria-label="Remove"
                            data-testid={TEST_IDS.levelsEditor.buttonRemove}
                          />
                          <Icon
                            title="Drag and drop to reorder"
                            name="draggabledots"
                            size="lg"
                            className={styles.dragIcon}
                            {...provided.dragHandleProps}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <InlineFieldRow data-testid={TEST_IDS.levelsEditor.newItem}>
        <InlineField label="New Level" grow={true}>
          <Select
            options={availableFieldOptions}
            value={newLevel?.value || null}
            aria-label={TEST_IDS.levelsEditor.newItemName}
            onChange={(event) => {
              setNewLevel({
                value: event.value,
                source: event.source,
                name: event.fieldName,
              });
            }}
          />
        </InlineField>
        <Button
          icon="plus"
          title="Add Level"
          disabled={!newLevel}
          onClick={onAddNewLevel}
          data-testid={TEST_IDS.levelsEditor.buttonAddNew}
        >
          Add
        </Button>
      </InlineFieldRow>
    </div>
  );
};

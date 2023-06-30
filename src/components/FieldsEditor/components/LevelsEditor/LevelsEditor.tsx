import React, { useState, useCallback, useMemo } from 'react';
import { cx } from '@emotion/css';
import { DataFrame, SelectableValue } from '@grafana/data';
import { useTheme2, Icon, IconButton, InlineFieldRow, InlineField, Select, Button } from '@grafana/ui';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import { TestIds } from '../../../../constants';
import { Level, LevelsGroup } from '../../../../types';
import { Styles } from './styles';

/**
 * Reorder
 * @param list
 * @param startIndex
 * @param endIndex
 */
const reorder = (list: Level[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

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
  onChange: (item: LevelsGroup) => void;
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
  const styles = Styles(theme);

  /**
   * States
   */
  const [items, setItems] = useState(groupLevels || []);
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
      const dataFrame = data.find((dataFrame) => dataFrame.refId === nameField?.source);

      return (
        dataFrame?.fields
          .map(({ name }) => ({
            label: name,
            source: dataFrame.refId,
            value: name,
            fieldName: name,
          }))
          .filter((option) => !items.some((item) => item.name === option.value)) || []
      );
    }

    return data.reduce((acc: SelectableValue[], dataFrame) => {
      return acc.concat(
        dataFrame.fields.map((field) => ({
          value: `${dataFrame.refId}:${field.name}`,
          fieldName: field.name,
          label: `${dataFrame.refId}:${field.name}`,
          source: dataFrame.refId,
        }))
      );
    }, []);
  }, [data, items]);

  /**
   * Add New Level
   */
  const onAddNewLevel = useCallback(() => {
    if (newLevel) {
      onChangeItems([
        {
          name: newLevel.name,
          source: newLevel.source,
        },
        ...items,
      ]);
      setNewLevel(null);
    }
  }, [items, newLevel, onChangeItems]);

  return (
    <>
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
                      data-testid={TestIds.fieldsEditor.level(item.name)}
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
                            data-testid={TestIds.fieldsEditor.buttonRemove}
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

      <div className={styles.newLevel} data-testid={TestIds.fieldsEditor.newLevel}>
        <InlineFieldRow>
          <InlineField label="New Level" grow={true}>
            <Select
              options={availableFieldOptions}
              value={newLevel?.value || null}
              aria-label={TestIds.fieldsEditor.newLevelField}
              onChange={(event) => {
                setNewLevel({
                  value: event.value || '',
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
            data-testid={TestIds.fieldsEditor.buttonAddNew}
          >
            Add
          </Button>
        </InlineFieldRow>
      </div>
    </>
  );
};

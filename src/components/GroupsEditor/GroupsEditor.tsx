import { cx } from '@emotion/css';
import { StandardEditorProps } from '@grafana/data';
import { Button, Icon, InlineField, InlineFieldRow, Input, useTheme2 } from '@grafana/ui';
import React, { useCallback, useMemo, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggingStyle,
  Droppable,
  DropResult,
  NotDraggingStyle,
} from 'react-beautiful-dnd';

import { TestIds } from '../../constants';
import { LevelsGroup, PanelOptions } from '../../types';
import { reorder } from '../../utils';
import { Collapse } from '../Collapse';
import { LevelsEditor } from '../LevelsEditor';
import { Styles } from './styles';

/**
 * Properties
 */
interface Props extends StandardEditorProps<LevelsGroup[], any, PanelOptions> {}

/**
 * Get Item Style
 */
const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
  /**
   * styles we need to apply on draggables
   */
  ...draggableStyle,
});

/**
 * Groups Editor
 * @constructor
 */
export const GroupsEditor: React.FC<Props> = ({ context: { options, data }, onChange }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = Styles(theme);

  /**
   * States
   */
  const [items, setItems] = useState<LevelsGroup[]>(options?.groups || []);
  const [newGroup, setNewGroup] = useState('');
  const [collapseState, setCollapseState] = useState<Record<string, boolean>>({});
  const [editItem, setEditItem] = useState('');
  const [editName, setEditName] = useState('');

  /**
  /**
   * Change groups
   */
  const onChangeItems = useCallback(
    (items: LevelsGroup[]) => {
      setItems(items);
      onChange(items);
    },
    [onChange]
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
   * Toggle collapse state for group
   */
  const onToggleGroup = useCallback((name: string) => {
    setCollapseState((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }, []);

  /**
   * Add new group
   */
  const onAddNewGroup = useCallback(() => {
    setNewGroup('');
    onChangeItems(items.concat([{ name: newGroup, items: [] }]));
    onToggleGroup(newGroup);
  }, [items, newGroup, onChangeItems, onToggleGroup]);

  /**
   * Change Group
   */
  const onChangeItem = useCallback(
    (updatedItem: LevelsGroup) => {
      onChangeItems(items.map((item) => (item.name === updatedItem.name ? updatedItem : item)));
    },
    [items, onChangeItems]
  );

  /**
   * Is Name Exists error
   */
  const isNameExistsError = useMemo(() => {
    return items.some((item) => item.name === newGroup);
  }, [items, newGroup]);

  /**
   * On Cancel Edit
   */
  const onCancelEdit = useCallback(() => {
    setEditItem('');
    setEditName('');
    setCollapseState((prev) => ({
      ...prev,
      [editItem]: prev[editItem] ? editItem === editName : false,
      [editName]: prev[editItem],
    }));
  }, [editItem, editName]);

  /**
   * Check Updated Name
   */
  const isUpdatedNameValid = useMemo(() => {
    if (!editName.trim()) {
      return false;
    }

    if (editItem !== editName) {
      return !items.some((item) => item.name === editName);
    }
    return true;
  }, [editItem, editName, items]);

  /**
   * On Save Name
   */
  const onSaveName = useCallback(() => {
    onChangeItems(
      items.map((item) =>
        item.name === editItem
          ? {
              ...item,
              name: editName,
            }
          : item
      )
    );
    onCancelEdit();
  }, [items, onChangeItems, onCancelEdit, editItem, editName]);

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="groups-editor">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map(({ name, items: levels }, index) => (
                <Draggable key={name} draggableId={name} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                      className={styles.group}
                    >
                      <Collapse
                        key={name}
                        title={
                          editItem === name ? (
                            <div
                              className={cx(styles.groupHeader, styles.groupHeaderForm)}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <InlineField className={styles.fieldName} invalid={!isUpdatedNameValid}>
                                <Input
                                  autoFocus={true}
                                  value={editName}
                                  onChange={(event) => setEditName(event.currentTarget.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && isUpdatedNameValid) {
                                      onSaveName();
                                    }

                                    if (e.key === 'Escape') {
                                      onCancelEdit();
                                    }
                                  }}
                                  data-testid={TestIds.groupsEditor.fieldName}
                                />
                              </InlineField>
                              <Button
                                variant="secondary"
                                fill="text"
                                className={styles.actionButton}
                                icon="times"
                                size="sm"
                                onClick={onCancelEdit}
                                data-testid={TestIds.groupsEditor.buttonCancelRename}
                              />
                              <Button
                                variant="secondary"
                                fill="text"
                                className={styles.actionButton}
                                icon="save"
                                size="sm"
                                onClick={onSaveName}
                                disabled={!isUpdatedNameValid}
                                tooltip={
                                  isUpdatedNameValid ? '' : 'Name is empty or group with the same name already exists.'
                                }
                                data-testid={TestIds.groupsEditor.buttonSaveRename}
                              />
                            </div>
                          ) : (
                            <div className={cx(styles.groupHeader, styles.groupHeaderText)}>{name}</div>
                          )
                        }
                        headerTestId={TestIds.groupsEditor.item(name)}
                        actions={
                          <>
                            {editItem !== name && (
                              <Button
                                icon="edit"
                                variant="secondary"
                                fill="text"
                                size="sm"
                                className={styles.actionButton}
                                onClick={() => {
                                  /**
                                   * Start Edit
                                   */
                                  setEditName(name);
                                  setEditItem(name);
                                }}
                                data-testid={TestIds.groupsEditor.buttonStartRename}
                              />
                            )}
                            <Button
                              icon="trash-alt"
                              variant="secondary"
                              fill="text"
                              size="sm"
                              className={styles.actionButton}
                              onClick={() => {
                                /**
                                 * Remove group
                                 */
                                onChangeItems(items.filter((item) => item.name !== name));
                              }}
                              data-testid={TestIds.groupsEditor.buttonRemove}
                            />
                            <Icon name="draggabledots" {...provided.dragHandleProps} className={styles.dragIcon} />
                          </>
                        }
                        isOpen={collapseState[name]}
                        onToggle={() => onToggleGroup(name)}
                      >
                        <LevelsEditor name={name} items={levels} data={data} onChange={onChangeItem} />
                      </Collapse>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <InlineFieldRow className={styles.newGroup} data-testid={TestIds.groupsEditor.newItem}>
        <InlineField
          label="New Group"
          grow={true}
          invalid={isNameExistsError}
          error="Group with the same name already exists."
        >
          <Input
            placeholder="Unique name"
            value={newGroup}
            onChange={(event) => setNewGroup(event.currentTarget.value)}
            data-testid={TestIds.groupsEditor.newItemName}
          />
        </InlineField>
        <Button
          icon="plus"
          title="Add Group"
          disabled={!newGroup || isNameExistsError}
          onClick={onAddNewGroup}
          data-testid={TestIds.groupsEditor.buttonAddNew}
        >
          Add
        </Button>
      </InlineFieldRow>
    </>
  );
};

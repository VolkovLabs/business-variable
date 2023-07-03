import React, { useCallback, useMemo, useState } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Button, Collapse, InlineField, InlineFieldRow, Input, useTheme2 } from '@grafana/ui';
import { TestIds } from '../../constants';
import { LevelsGroup, PanelOptions } from '../../types';
import { LevelsEditor } from '../LevelsEditor';
import { Styles } from './styles';

/**
 * Properties
 */
interface Props extends StandardEditorProps<LevelsGroup[], any, PanelOptions> {}

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

  return (
    <>
      {items.map(({ name, items: levels }) => (
        <Collapse
          key={name}
          label={
            <div className={styles.groupHeader} data-testid={TestIds.groupsEditor.item(name)}>
              {name}
              <Button
                icon="trash-alt"
                variant="secondary"
                fill="text"
                size="sm"
                className={styles.groupRemove}
                onClick={(event) => {
                  /**
                   * Prevent collapse event
                   */
                  event.stopPropagation();

                  /**
                   * Remove group
                   */
                  onChangeItems(items.filter((item) => item.name !== name));
                }}
                data-testid={TestIds.groupsEditor.buttonRemove}
              />
            </div>
          }
          isOpen={collapseState[name]}
          onToggle={() => onToggleGroup(name)}
          collapsible={true}
        >
          <LevelsEditor name={name} items={levels} data={data} onChange={onChangeItem} />
        </Collapse>
      ))}

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

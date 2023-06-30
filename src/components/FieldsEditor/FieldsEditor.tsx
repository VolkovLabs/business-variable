import React, { useState, useCallback } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { useTheme2, Input, InlineField, Button, Collapse } from '@grafana/ui';
import { TestIds } from '../../constants';
import { LevelsGroup, PanelOptions } from '../../types';
import { LevelsEditor } from './components/LevelsEditor';
import { Styles } from './styles';

/**
 * Properties
 */
interface Props extends StandardEditorProps<LevelsGroup[], any, PanelOptions> {}

/**
 * Fields Editor
 * @constructor
 */
export const FieldsEditor: React.FC<Props> = ({ context: { options, data }, onChange }) => {
  /**
   * Styles and Theme
   */
  const theme = useTheme2();
  const styles = Styles(theme);

  /**
   * States
   */
  const [items, setItems] = useState<LevelsGroup[]>(options?.levelsGroups || []);
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
   * Add new group
   */
  const onAddNewGroup = useCallback(() => {
    setNewGroup('');
    onChangeItems(items.concat([{ name: newGroup, items: [] }]));
  }, [items, newGroup, onChangeItems]);

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
   * Change Group
   */
  const onChangeItem = useCallback(
    (updatedItem: LevelsGroup) => {
      onChangeItems(items.map((item) => (item.name === updatedItem.name ? updatedItem : item)));
    },
    [items, onChangeItems]
  );

  return (
    <>
      {items.map(({ name, items }) => (
        <Collapse
          key={name}
          label={name}
          isOpen={collapseState[name]}
          onToggle={() => onToggleGroup(name)}
          collapsible={true}
        >
          <LevelsEditor name={name} items={items} data={data} onChange={onChangeItem} />
        </Collapse>
      ))}

      <div className={styles.newGroup} data-testid={TestIds.fieldsEditor.newLevel}>
        <InlineField label="New" grow={true}>
          <Input
            placeholder="Group name"
            value={newGroup}
            onChange={(event) => setNewGroup(event.currentTarget.value)}
          />
        </InlineField>
        <Button
          icon="plus"
          title="Add Group"
          disabled={!newGroup}
          onClick={onAddNewGroup}
          data-testid={TestIds.fieldsEditor.buttonAddNew}
        >
          Add
        </Button>
      </div>
    </>
  );
};

import React, { useContext } from 'react';
import { BuilderGroupValues, BuilderContext } from '../Builder';
import uniqid from 'uniqid';
import { clone } from '../../utils/clone';

export interface GroupProps {
  value?: BuilderGroupValues;
  isNegated?: boolean;
  children?: React.ReactNode | React.ReactNodeArray;
  id: string;
  isRoot: boolean;
}

export const Group: React.FC<GroupProps> = ({
  value,
  isNegated,
  children,
  id,
  isRoot,
}) => {
  const { components, data, setData, onChange, strings } = useContext(
    BuilderContext
  );
  const {
    Add,
    Group: GroupContainer,
    GroupHeaderOption: Option,
    Remove,
  } = components;

  const findIndex = () => {
    const clonedData = clone(data);
    const parentIndex = clonedData.findIndex((item: any) => item.id === id);
    let insertAfter = parentIndex;

    if (data[parentIndex].children && data[parentIndex].children.length > 0) {
      const lastChildren = clonedData[parentIndex].children.slice(-1)[0];
      insertAfter = clonedData.findIndex(
        (item: any) => item.id === lastChildren
      );
    }

    return { insertAfter, parentIndex, clonedData };
  };

  const addItem = (payload: any) => {
    const { insertAfter, parentIndex, clonedData } = findIndex();

    if (!clonedData[parentIndex].children) {
      clonedData[insertAfter].children = [];
    }

    clonedData[parentIndex].children.push(payload.id);
    clonedData.splice(Number(insertAfter) + 1, 0, payload);

    setData(clonedData);
    onChange(clonedData);
  };

  const handleAddGroup = () => {
    const EmptyGroup: any = {
      type: 'GROUP',
      value: 'AND',
      isNegated: false,
      id: uniqid(),
      parent: id,
      children: [],
    };

    addItem(EmptyGroup);
  };

  const handleAddRule = () => {
    const EmptyRule: any = {
      field: '',
      id: uniqid(),
      parent: id,
    };

    addItem(EmptyRule);
  };

  const handleChangeGroupType = (nextValue: BuilderGroupValues) => {
    const { clonedData, parentIndex } = findIndex();
    clonedData[parentIndex].value = nextValue;

    setData(clonedData);
    onChange(clonedData);
  };

  const handleToggleNegateGroup = (nextValue: boolean) => {
    const { clonedData, parentIndex } = findIndex();
    clonedData[parentIndex].isNegated = nextValue;

    setData(clonedData);
    onChange(clonedData);
  };

  const handleDeleteGroup = () => {
    let clonedData = clone(data).filter((item: any) => item.id !== id);

    clonedData = clonedData.map((item: any) => {
      if (item.children && item.children.length > 0) {
        item.children = item.children.filter(
          (childId: string) => childId !== id
        );
      }

      return item;
    });

    setData(clonedData);
    onChange(clonedData);
  };

  if (strings.group) {
    return (
      <GroupContainer
        controlsLeft={
          <>
            <Option
              isSelected={!!isNegated}
              value={!isNegated}
              onClick={handleToggleNegateGroup}
            >
              {strings.group.not}
            </Option>
            <Option
              isSelected={value === 'AND'}
              value="AND"
              onClick={handleChangeGroupType}
            >
              {strings.group.and}
            </Option>
            <Option
              isSelected={value === 'OR'}
              value="OR"
              onClick={handleChangeGroupType}
            >
              {strings.group.or}
            </Option>
          </>
        }
        controlsRight={
          <>
            <Add onClick={handleAddRule} label={strings.group.addRule} />
            <Add onClick={handleAddGroup} label={strings.group.addGroup} />
            {!isRoot && (
              <Remove
                onClick={handleDeleteGroup}
                label={strings.group.delete}
              />
            )}
          </>
        }
      >
        {children}
      </GroupContainer>
    );
  }

  return null;
};

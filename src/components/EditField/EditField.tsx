import React, { useState, useRef, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import { Edit, Check } from '@material-ui/icons';

import './EditField.css';

interface Props {
  label: string;
  value: string;
  editing?: boolean;
  onChange?:
    | ((e: React.ChangeEvent<HTMLInputElement>) => void | undefined)
    | undefined;
  onSubmit?: (() => void) | undefined;
}

const EditField: React.FC<Props> = ({ label, value, onChange, onSubmit }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const valueRef = useRef<HTMLInputElement>(null);
  const closeOnEnter = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (isEditing && onSubmit) onSubmit();
      setIsEditing(false);
    }
  };
  useEffect(() => {
    if (isEditing) valueRef.current?.focus();
  }, [isEditing]);
  useEffect(() => {}, [onChange]);
  return (
    <div className='editField'>
      <div className='editField__label'>{label}</div>
      <div className='editField__lower'>
        <input
          onKeyDown={closeOnEnter}
          value={value}
          className='editField__value'
          disabled={!isEditing}
          onChange={onChange}
          ref={valueRef}
        />
        <IconButton
          onClick={() => {
            if (isEditing && onSubmit) onSubmit();
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? <Check /> : <Edit />}
        </IconButton>
      </div>
    </div>
  );
};

export default EditField;

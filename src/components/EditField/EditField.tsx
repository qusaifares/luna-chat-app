import React, { useState, useRef, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import { Edit, Check } from '@material-ui/icons';

import './EditField.css';

interface Props {
  label: string;
  value: string;
  editing?: boolean;
  onChange?: (e: React.ChangeEvent) => void;
}

const EditField: React.FC<Props> = ({ label, value, onChange }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const valueRef = useRef<HTMLDivElement>(null);
  const closeOnEnter = (e: React.KeyboardEvent) => {
    console.log(e);
    if (e.keyCode === 13) {
      e.preventDefault();
      setIsEditing(false);
    }
  };
  useEffect(() => {
    if (isEditing) valueRef.current?.focus();
  }, [isEditing]);
  return (
    <div className='editField'>
      <div className='editField__label'>{label}</div>
      <div className='editField__lower'>
        <div
          onKeyDown={closeOnEnter}
          className='editField__value'
          contentEditable={isEditing}
          ref={valueRef}
        >
          {value}
        </div>
        <IconButton onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <Check /> : <Edit />}
        </IconButton>
      </div>
    </div>
  );
};

export default EditField;

import React from 'react';
import {} from '@material-ui/icons';

import './EditField.css';

interface Props {
  label: string;
  value: string;
  editing?: boolean;
  onChange?: (e: React.ChangeEvent) => void;
}

const EditField: React.FC<Props> = ({ label, value, editing, onChange }) => {
  return (
    <div className='editField'>
      <div className='editField__label'>{label}</div>
      <div className='editField__value' contentEditable={editing}>
        {value}
      </div>
    </div>
  );
};

export default EditField;

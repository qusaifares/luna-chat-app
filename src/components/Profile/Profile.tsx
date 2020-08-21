import React, { useState } from 'react';

import EditField from '../EditField/EditField';

import { Avatar } from '@material-ui/core';

import { useStateValue } from '../../store/StateProvider';
import { actionTypes } from '../../store/reducer';

import './Profile.css';

interface Props {}

const Profile: React.FC<Props> = (props) => {
  const [{ user }, dispatch] = useStateValue();
  const [nameEditing, setNameEditing] = useState<boolean>(false);

  return (
    <div className='profile'>
      <Avatar src={user?.photoURL} />
      <EditField label='Your Name' value='Qusai' editing={false} />
    </div>
  );
};

export default Profile;

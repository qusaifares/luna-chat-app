import React, { useState, useEffect } from 'react';

import EditField from '../EditField/EditField';

import { Avatar } from '@material-ui/core';

import { useStateValue } from '../../store/StateProvider';
import { actionTypes } from '../../store/reducer';

import db from '../../firebase';
import firebase from 'firebase';

import './Profile.css';
import { unstable_renderSubtreeIntoContainer } from 'react-dom';

interface Props {}

const Profile: React.FC<Props> = (props) => {
  const [{ user }, dispatch] = useStateValue();
  const [nameString, setNameString] = useState<string>('');
  useEffect(() => {
    setNameString(user?.name || '');
  }, [user]);

  useEffect(() => {
    console.log(nameString);
  }, [nameString]);

  const submitName = (): void => {
    const userRef = db.collection('users').doc(user.google_uid);
    userRef.get().then((doc) => {
      let data = doc.data();
      console.log(data);
      if (!data) return;
      // if name is same as string
      if (nameString === data.name) return;

      // if string is too long or too short
      if (!nameString || nameString.length > 25)
        return setNameString(data.name);

      userRef.update({ name: nameString }).then(() => {
        if (!data) return;
        data.name = nameString;
        dispatch({ type: actionTypes.SET_USER, value: data });
      });
    });
  };

  return (
    <div className='profile'>
      <Avatar src={user?.photoURL} />
      <EditField
        label='Your Name'
        value={nameString}
        onChange={(e) => setNameString(e.target.value)}
        onSubmit={submitName}
      />
    </div>
  );
};

export default Profile;

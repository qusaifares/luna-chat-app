import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import firebase from 'firebase';
import db from '../../firebase';

import { actionTypes } from '../../store/reducer';
import { useStateValue } from '../../store/StateProvider';

interface Props {
  roomId: string;
}

const Invite: React.FC<Props> = ({ roomId }) => {
  let history = useHistory();
  const [{ user }, dispatch] = useStateValue();
  const [valid, setValid] = useState<boolean>(true);
  useEffect(() => {
    if (!user) return;

    const roomRef = db.collection('rooms').doc(roomId);
    roomRef.get().then((roomDoc) => {
      if (roomDoc.exists) {
        const userRef = db.collection('users').doc(user.google_uid);
        userRef
          .get()
          .then((userDoc) => {
            if (userDoc.exists) {
              // add user to room's members array
              roomRef
                .update({
                  members: firebase.firestore.FieldValue.arrayUnion(userRef)
                })
                .catch((err) => console.log(err));
              // add room to use's room array
              userRef
                .update({
                  rooms: firebase.firestore.FieldValue.arrayUnion(roomRef)
                })
                .then(() => history.push(`/rooms/${roomId}`))
                .catch((err) => console.log(err));
            } else {
              return;
            }
          })
          .catch((err) => console.log(err));
      } else {
        setValid(false);
      }
    });
  }, [user]);
  return <div className='invite'>Joining room</div>;
};

export default Invite;

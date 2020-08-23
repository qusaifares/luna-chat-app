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

  const checkIfUserIsMember = (members: string[]): void => {};

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
              let memberIds: string[] = [];
              roomDoc
                ?.data()
                ?.members.forEach(
                  (
                    memberRef: firebase.firestore.DocumentData,
                    i: number,
                    arr: firebase.firestore.DocumentData[]
                  ) => {
                    // push ids of all group members to check if user already in there
                    memberIds.push(memberRef.id);
                    if (
                      i === arr.length - 1 &&
                      !memberIds.includes(user.google_uid)
                    ) {
                      // send system message
                      const messageToSend = {
                        messageType: 'join',
                        content: `${user.name} joined the group.`,
                        google_uid: user.google_uid,
                        name: user.name,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                      };
                      const messagesRef = db
                        .collection('rooms')
                        .doc(roomId)
                        .collection('messages');
                      messagesRef
                        .add(messageToSend)
                        .catch((err) => console.log(err));
                    }
                  }
                );
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

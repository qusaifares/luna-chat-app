import React, { useState, useEffect, forwardRef } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { Avatar } from '@material-ui/core';

import './SidebarChat.css';

import { useStateValue } from '../../store/StateProvider';

import db from '../../firebase';
import firebase from 'firebase';

import sidebarChatDate from './sidebarChatDate';

interface Props {
  addNewChat?: boolean;
  room?: any;
  id?: string;
}

const SidebarChat: React.ForwardRefExoticComponent<
  Props & React.RefAttributes<HTMLDivElement>
> = forwardRef(({ addNewChat, room, id }, ref) => {
  let history = useHistory();
  const [{ user }, dispatch] = useStateValue();
  const [
    lastMessage,
    setLastMessage
  ] = useState<firebase.firestore.DocumentData | null>();

  const createChat = (): void => {
    if (!user) return;
    const roomName = prompt('Please enter a name for the chat.');
    if (!roomName) return;

    const userRef = db.collection('users').doc(user.google_uid);

    db.collection('rooms')
      .add({ name: roomName, members: [userRef] })
      .then((roomRef) => {
        userRef
          .update({
            rooms: firebase.firestore.FieldValue.arrayUnion(roomRef)
          })
          .then(() => history.push(`/rooms/${roomRef.id}`))
          .catch((err) => console.log(err));
      });
  };

  useEffect(() => {
    if (!id) return;
    const unsubscribe = db
      .collection('rooms')
      .doc(id)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        let tempLastMsg = snapshot.docs.map((doc) => doc.data())[0];
        if (tempLastMsg) {
          tempLastMsg.name = tempLastMsg.name.split(' ')[0];
          tempLastMsg.dateString = sidebarChatDate(
            tempLastMsg?.timestamp?.toDate()
          );
          setLastMessage(tempLastMsg);
        } else {
          setLastMessage(null);
        }
      });
    return () => {
      unsubscribe();
    };
  }, [id]);

  return !addNewChat ? (
    <Link to={`/rooms/${id}`}>
      <div ref={ref} className='sidebarChat'>
        <Avatar />
        <div className='sidebarChat__info'>
          <h2>{room.name}</h2>
          <div className='sidebarChat__timestamp'>
            {lastMessage?.dateString}
          </div>
          <p>
            {lastMessage?.content &&
              `${!lastMessage?.messageType ? `${lastMessage?.name}: ` : ''}${
                lastMessage?.name?.length + lastMessage?.content?.length > 25
                  ? lastMessage?.content
                      .substring(0, 25 - lastMessage?.name?.length)
                      .trim() + '...'
                  : lastMessage.content
              }`}
          </p>
        </div>
      </div>
    </Link>
  ) : (
    <div className='sidebarChat' onClick={createChat}>
      <h2>Add New Chat</h2>
    </div>
  );
});

export default SidebarChat;

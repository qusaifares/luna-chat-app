import React, { useState, useEffect } from 'react';
import { Avatar, IconButton } from '@material-ui/core';
import { DonutLarge, Chat, MoreVert, SearchOutlined } from '@material-ui/icons';
import SidebarChat from '../SidebarChat/SidebarChat';

import { useStateValue } from '../../store/StateProvider';

import db from '../../firebase';
import firebase from 'firebase';

import './Sidebar.css';
interface Room {
  id: string;
  data: firebase.firestore.DocumentData;
}
interface Props {}

const Sidebar: React.FC<Props> = (props) => {
  const [{ user, google_user }, dispatch] = useStateValue();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomIds, setRoomIds] = useState<string[]>([]);

  useEffect(() => {
    // Returns unsubscribe value
    if (!google_user.uid) return;
    console.log(google_user);
    const unsubscribe = db
      .collection('users')
      .doc(google_user.uid)
      .onSnapshot((snapshot) => {
        // returns ids of rooms
        console.log(snapshot?.data());
        const res = snapshot
          ?.data()
          ?.rooms?.map(
            (
              room: firebase.firestore.QueryDocumentSnapshot<
                firebase.firestore.DocumentData
              >
            ) => room.id
          );
        if (res) setRoomIds(res);
        console.log(roomIds);
        // setRooms(
        //   snapshot.docs.map((doc) => ({
        //     id: doc.id,
        //     data: doc.data()
        //   }))
        // );
      });

    // Cleanup on dismount
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!roomIds.length) return;
    console.log(roomIds);
    const unsubscribe = db
      .collection('rooms')
      .where(firebase.firestore.FieldPath.documentId(), 'in', roomIds)
      .onSnapshot((snapshot) => {
        const tempRooms = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data()
        }));
        console.log(tempRooms);
        setRooms(tempRooms);
      });
    return unsubscribe;
  }, [roomIds]);

  return (
    <div className='sidebar'>
      <div className='sidebar__header'>
        <Avatar src={user?.photoURL} />
        <div className='sidebar__headerRight'>
          <IconButton>
            <DonutLarge />
          </IconButton>
          <IconButton>
            <Chat />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <div className='sidebar__search'>
        <div className='sidebar__searchContainer'>
          <SearchOutlined />
          <input type='text' placeholder='Search or start new chat' />
        </div>
      </div>
      <div className='sidebar__chats'>
        <SidebarChat addNewChat />
        {rooms.map((room) => (
          <SidebarChat key={room.id} room={room.data} id={room.id} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;

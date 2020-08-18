import React, { useState, useEffect } from 'react';
import { Avatar, IconButton } from '@material-ui/core';
import { DonutLarge, Chat, MoreVert, SearchOutlined } from '@material-ui/icons';
import SidebarChat from '../SidebarChat/SidebarChat';

import { useStateValue } from '../../store/StateProvider';

import db from '../../firebase';

import './Sidebar.css';
interface Room {
  id: string;
  data: firebase.firestore.DocumentData;
}
interface Props {}

const Sidebar: React.FC<Props> = (props) => {
  const [{ user }, dispatch] = useStateValue();
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    // Returns unsubscribe value
    const unsubscribe = db.collection('rooms').onSnapshot((snapshot) => {
      setRooms(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data()
        }))
      );
    });
    const test = () => {
      console.log(rooms);
    };
    test();
    // Cleanup on dismount
    return unsubscribe;
  }, []);
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

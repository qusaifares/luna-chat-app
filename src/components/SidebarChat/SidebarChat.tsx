import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Avatar } from '@material-ui/core';

import './SidebarChat.css';
import db from '../../firebase';

interface Props {
  addNewChat?: boolean;
  room?: any;
  id?: string;
}

const SidebarChat: React.FC<Props> = ({ addNewChat, room, id }) => {
  const createChat = (): void => {
    const roomName = prompt('Please enter a name for the chat.');
    if (!roomName) return;

    db.collection('rooms').add({ name: roomName });
  };

  return !addNewChat ? (
    <Link to={`/rooms/${id}`}>
      <div className='sidebarChat'>
        <Avatar />
        <div className='sidebarChat__info'>
          <h2>{room.name}</h2>
          <p>Last message...</p>
        </div>
      </div>
    </Link>
  ) : (
    <div className='sidebarChat' onClick={createChat}>
      <h2>Add New Chat</h2>
    </div>
  );
};

export default SidebarChat;

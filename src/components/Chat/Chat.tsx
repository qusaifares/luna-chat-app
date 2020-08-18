import React, { useState, useEffect } from 'react';
import { Avatar, IconButton } from '@material-ui/core';
import {
  SearchOutlined,
  AttachFile,
  MoreVert,
  InsertEmoticon,
  Mic
} from '@material-ui/icons';
import ChatMessage from '../ChatMessage/ChatMessage';

import db from '../../firebase';

import './Chat.css';

interface Props {
  roomId: string;
}

const Chat: React.FC<Props> = ({ roomId }) => {
  const [roomName, setRoomName] = useState<
    string | firebase.firestore.DocumentData
  >('');
  const [input, setInput] = useState<string>('');
  const sendMessage = (e: React.FormEvent): void => {
    e.preventDefault();
    setInput('');
  };

  useEffect(() => {
    if (!roomId) return;

    db.collection('rooms')
      .doc(roomId)
      .onSnapshot((snapshot) => {
        setRoomName(snapshot?.data()?.name);
      });
  }, [roomId]);
  return (
    <div className='chat'>
      <div className='chat__header'>
        <Avatar />
        <div className='chat__headerInfo'>
          <h3>{roomName}</h3>
          <p>Last seen at ...</p>
        </div>

        <div className='chat__headerRight'>
          <IconButton>
            <SearchOutlined />
          </IconButton>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <div className='chat__body'>
        <ChatMessage />
        <ChatMessage reciever />
      </div>
      <div className='chat__footer'>
        <InsertEmoticon />
        <form onSubmit={sendMessage}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type='text'
            placeholder='Type a message'
          />
          <button type='submit'>Send a message</button>
        </form>
        <Mic />
      </div>
    </div>
  );
};

export default Chat;

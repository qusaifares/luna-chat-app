import React, { useState, useEffect, useRef } from 'react';
import { Avatar, IconButton } from '@material-ui/core';
import {
  FilterNone,
  SearchOutlined,
  AttachFile,
  MoreVert,
  InsertEmoticon,
  Mic
} from '@material-ui/icons';
import ChatMessage from '../ChatMessage/ChatMessage';

import { useStateValue } from '../../store/StateProvider';

import firebase from 'firebase';
import db from '../../firebase';

import './Chat.css';

interface Message {
  content: string;
  google_uid: string;
  name: string;
  timestamp: firebase.firestore.FieldValue;
}

interface Props {
  roomId: string;
}

const Chat: React.FC<Props> = ({ roomId }) => {
  const [{ user }, dispatch] = useStateValue();

  const [roomName, setRoomName] = useState<
    string | firebase.firestore.DocumentData
  >('');
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<firebase.firestore.DocumentData[]>(
    []
  );

  const sendMessage = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!input) return;
    const messageToSend: Message = {
      content: input,
      google_uid: user.uid,
      name: user.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('rooms')
      .doc(roomId)
      .collection('messages')
      .add(messageToSend);

    setInput('');
  };

  useEffect(() => {
    if (!roomId) return;

    db.collection('rooms')
      .doc(roomId)
      .onSnapshot((snapshot) => {
        setRoomName(snapshot?.data()?.name);
      });

    db.collection('rooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot) =>
        setMessages(snapshot.docs.map((doc) => doc.data()))
      );
  }, [roomId]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const copyLink = (): void => {
    navigator.clipboard.writeText(`http://localhost:3000/invite/${roomId}`); // change when deployed
    alert('Invite link copied!');
  };

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
          <IconButton onClick={copyLink}>
            <FilterNone />
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
        {messages.map((message: firebase.firestore.DocumentData) => (
          <ChatMessage
            message={message}
            reciever={message.google_uid === user.uid}
          />
        ))}
        <div className='chat__bottom' ref={bottomRef}></div>
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

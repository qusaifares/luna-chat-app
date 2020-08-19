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
  const [{ google_user }, dispatch] = useStateValue();
  const [roomMemberNames, setRoomMemberNames] = useState<string[]>([]);

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
      google_uid: google_user.uid,
      name: google_user.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('rooms')
      .doc(roomId)
      .collection('messages')
      .add(messageToSend);

    setInput('');
  };

  const addRoomMembersFromSnapshot = (
    snapshot: firebase.firestore.DocumentSnapshot<
      firebase.firestore.DocumentData
    >
  ): void => {
    let tempMembers: string[] = [];
    snapshot
      ?.data()
      ?.members?.forEach(
        (
          member: firebase.firestore.DocumentData,
          i: number,
          arr: firebase.firestore.DocumentData[]
        ) => {
          member.get().then((memberData: firebase.firestore.DocumentData) => {
            console.log(roomMemberNames);
            tempMembers.push(memberData.data().name);
            if (i + 1 === arr.length) setRoomMemberNames(tempMembers);
          });
        }
      );
  };

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe1 = db
      .collection('rooms')
      .doc(roomId)
      .onSnapshot((snapshot) => {
        setRoomName(snapshot?.data()?.name);
        addRoomMembersFromSnapshot(snapshot);
      });

    const unsubscribe2 = db
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot) =>
        setMessages(
          snapshot.docs.map((doc) => ({ id: doc.id, message: doc.data() }))
        )
      );
    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [roomId]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const copyLink = (): void => {
    navigator.clipboard
      .writeText(`http://localhost:3000/invite/${roomId}`)
      .then(() => alert('Invite link copied!'))
      .catch((err) => console.log(err)); // change when deployed
  };

  return (
    <div className='chat'>
      <div className='chat__header'>
        <Avatar />
        <div className='chat__headerInfo'>
          <h3>{roomName}</h3>
          <p>
            {roomMemberNames.join(', ').length < 40
              ? roomMemberNames.join(', ')
              : `${roomMemberNames.join(', ').substring(0, 40)}...`}
          </p>
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
            key={message.id}
            message={message.message}
            userMessage={message.message.google_uid === google_user?.uid}
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

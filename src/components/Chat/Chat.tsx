import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
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
import SystemMessage from '../SystemMessage/SystemMessage';
import IconContainer from '../IconContainer/IconContainer';

import getDateMessage from '../SystemMessage/getDateMessage';

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
  let history = useHistory();

  const [{ user, google_user }, dispatch] = useStateValue();
  const [roomMemberNames, setRoomMemberNames] = useState<string[]>([]);
  const [inviteTooltip, setInviteTooltip] = useState('Copy Invite Link');

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

    const messagesRef = db
      .collection('rooms')
      .doc(roomId)
      .collection('messages');

    messagesRef.add(messageToSend).then(() => {
      messagesRef
        .orderBy('timestamp', 'asc')
        .get()
        .then((msgs) =>
          setMessages(
            msgs.docs.map((msg) => ({ id: msg.id, message: msg.data() }))
          )
        );
    });
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
            tempMembers.push(memberData.data().name);
            if (i + 1 === arr.length) setRoomMemberNames(tempMembers);
          });
        }
      );
  };

  useEffect(() => {
    if (!roomId) return;

    const roomRef = db
      .collection('rooms')
      .doc(roomId)
      .get()
      .then((roomDoc) => {
        if (!roomDoc.exists) {
          history.push('/');
        }
      });

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
      .writeText(`${window.location.origin}/invite/${roomId}`)
      .then(() => {
        setInviteTooltip('Invite Link Copied!');
        setTimeout(() => {
          setInviteTooltip('Copy Invite Link');
        }, 4000);
      })
      .catch((err) => console.log(err));
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
          <IconContainer tooltip='Search'>
            <IconButton>
              <SearchOutlined />
            </IconButton>
          </IconContainer>
          <IconContainer tooltip={inviteTooltip}>
            <IconButton onClick={copyLink}>
              <FilterNone />
            </IconButton>
          </IconContainer>
          <IconContainer tooltip='Attach File'>
            <IconButton>
              <AttachFile />
            </IconButton>
          </IconContainer>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <div className='chat__body'>
        {messages.map((message: firebase.firestore.DocumentData, i, msgs) => {
          if (
            !i ||
            getDateMessage(message.message.timestamp.toDate()) !==
              getDateMessage(messages[i - 1].message.timestamp.toDate())
          ) {
            return (
              <>
                <SystemMessage
                  dateObject={message?.message?.timestamp?.toDate()}
                  messageType='date'
                />
                <ChatMessage
                  key={message.id}
                  messageType={message.message.messageType}
                  message={message.message}
                  userMessage={message.message.google_uid === user?.google_uid}
                />
              </>
            );
          } else {
            return (
              <ChatMessage
                key={message.id}
                messageType={message.message.messageType}
                message={message.message}
                userMessage={message.message.google_uid === google_user?.uid}
              />
            );
          }
        })}
        <div className='chat__bottom' ref={bottomRef}></div>
      </div>
      <div className='chat__footer'>
        <IconButton>
          <InsertEmoticon />
        </IconButton>
        <form onSubmit={sendMessage}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type='text'
            placeholder='Type a message'
          />
          <button type='submit'>Send a message</button>
        </form>
        <IconButton>
          <Mic />
        </IconButton>
      </div>
    </div>
  );
};

export default Chat;

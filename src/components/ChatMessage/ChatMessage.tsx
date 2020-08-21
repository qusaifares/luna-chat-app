import React, { useState, useEffect } from 'react';

import SystemMessage from '../SystemMessage/SystemMessage';

import './ChatMessage.css';

interface Props {
  message: firebase.firestore.DocumentData;
  userMessage?: boolean;
  messageType?: 'date' | 'join';
}

const ChatMessage: React.FC<Props> = ({
  message,
  userMessage,
  messageType
}) => {
  const [isToday, setIsToday] = useState<boolean>(false);
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    console.log(message.timestamp?.toDate().getDay());
    if (today === message.timestamp?.toDate().toLocaleDateString()) {
      setIsToday(true);
    } else {
      setIsToday(false);
    }
  }, [message.timestamp]);

  if (messageType === 'join') {
    return <SystemMessage messageType={messageType} message={message} />;
  }

  return (
    <p className={`chatMessage ${userMessage && 'chatMessage__userMessage'}`}>
      {!userMessage && (
        <span className='chatMessage__name'>{message.name}</span>
      )}
      {message.content}
      <span className='chatMessage__timestamp'>
        {message.timestamp?.toDate().toLocaleTimeString(navigator.language, {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </span>
    </p>
  );
};

export default ChatMessage;

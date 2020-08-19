import React, { useState, useEffect } from 'react';

import './ChatMessage.css';

interface Props {
  message: any;
  reciever?: boolean;
}

const ChatMessage: React.FC<Props> = ({ message, reciever }) => {
  const [isToday, setIsToday] = useState<boolean>(false);
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    if (today === new Date(message.timestamp?.toDate()).toLocaleDateString()) {
      setIsToday(true);
    } else {
      setIsToday(false);
    }
  });
  return (
    <p className={`chatMessage ${reciever && 'chatMessage__reciever'}`}>
      <span className='chatMessage__name'>{message.name}</span>
      {message.content}
      <span className='chatMessage__timestamp'>
        {isToday
          ? new Date(message.timestamp?.toDate()).toLocaleTimeString()
          : new Date(message.timestamp?.toDate()).toLocaleString()}
      </span>
    </p>
  );
};

export default ChatMessage;

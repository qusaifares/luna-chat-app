import React from 'react';

import './ChatMessage.css';

interface Props {
  reciever?: boolean;
}

const ChatMessage: React.FC<Props> = ({ reciever }) => {
  return (
    <p className={`chatMessage ${reciever && 'chatMessage__reciever'}`}>
      <span className='chatMessage__name'>Qusai Fares</span>
      Hello there
      <span className='chatMessage__timestamp'>3:21 PM</span>
    </p>
  );
};

export default ChatMessage;

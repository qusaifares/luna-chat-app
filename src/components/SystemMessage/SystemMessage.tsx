import React, { useState, useEffect } from 'react';
import getDateMessage from './getDateMessage';

import './SystemMessage.css';

import { useStateValue } from '../../store/StateProvider';

interface Props {
  dateObject?: Date;
  userObject?: firebase.firestore.DocumentData;
  messageType: 'date' | 'join';
  message?: firebase.firestore.DocumentData;
}

const SystemMessage: React.FC<Props> = ({
  messageType,
  dateObject,
  message
}) => {
  const [messageDisplayed, setMessageDisplayed] = useState<string>('');

  useEffect(() => {
    if (!dateObject && !message) return;

    if (messageType === 'date' && dateObject) {
      setMessageDisplayed(getDateMessage(dateObject));
    } else if (messageType === 'join' && message) {
      setMessageDisplayed(`${message.name} joined the group.`);
    } else {
      setMessageDisplayed('');
    }
  }, [messageType, dateObject, message]);

  return <div className='systemMessage'>{messageDisplayed}</div>;
};

export default SystemMessage;

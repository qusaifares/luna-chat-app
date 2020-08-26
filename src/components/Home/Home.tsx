import React from 'react';
import { Chat } from '@material-ui/icons';

import './Home.css';

interface Props {}

const Home: React.FC<Props> = (props) => {
  return (
    <div className='home'>
      <div className='home__container'>
        <img src={`${process.env.PUBLIC_URL}/images/chat_logo.png`} alt='' />
        <h2>Click a chat to begin</h2>
      </div>
    </div>
  );
};

export default Home;

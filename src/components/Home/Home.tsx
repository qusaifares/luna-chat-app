import React from 'react';
import { WhatsApp } from '@material-ui/icons';

import './Home.css';

interface Props {}

const Home: React.FC<Props> = (props) => {
  return (
    <div className='home'>
      <div className='home__container'>
        <WhatsApp />
        <h2>Click a chat to begin</h2>
      </div>
    </div>
  );
};

export default Home;

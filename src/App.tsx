import React, { useState, useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import Sidebar from './components/Sidebar/Sidebar';
import Chat from './components/Chat/Chat';
import Login from './components/Login/Login';

import { useStateValue } from './store/StateProvider';

import './App.css';

const App = () => {
  let history = useHistory();
  const [{ user }, dispatch] = useStateValue();

  useEffect(() => {
    if (!user) {
      history.push('/');
    }
  });

  return (
    <div className='app'>
      {user ? (
        <div className='app__body'>
          <Sidebar />
          <Switch>
            <Route
              path='/rooms/:id'
              exact
              render={(routerProps) => (
                <Chat roomId={routerProps.match.params.id} />
              )}
            />
            <Route path='/' exact component={Chat} />
          </Switch>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;

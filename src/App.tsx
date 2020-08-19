import React, { useState, useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import Home from './components/Home/Home';
import Sidebar from './components/Sidebar/Sidebar';
import Chat from './components/Chat/Chat';
import Login from './components/Login/Login';

import { actionTypes } from './store/reducer';
import { useStateValue } from './store/StateProvider';
import { auth } from './firebase';

import './App.css';

const App = () => {
  let history = useHistory();
  const [{ user }, dispatch] = useStateValue();

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      console.log(authUser);
      dispatch({
        type: actionTypes.SET_USER,
        value: authUser
      });
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      history.push('/');
    }
  }, []);

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
            <Route path='/' exact component={Home} />
          </Switch>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;

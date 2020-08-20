import React, { useState, useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import Home from './components/Home/Home';
import Sidebar from './components/Sidebar/Sidebar';
import Chat from './components/Chat/Chat';
import Login from './components/Login/Login';
import Invite from './components/Invite/Invite';

import { actionTypes } from './store/reducer';
import { useStateValue } from './store/StateProvider';
import db, { auth } from './firebase';

import './App.css';

const App = () => {
  let history = useHistory();
  const [{ user, google_user }, dispatch] = useStateValue();

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      dispatch({
        type: actionTypes.SET_GOOGLE_USER,
        value: authUser
      });
      dispatch({});
    });
  }, []);

  useEffect(() => {
    if (!google_user || !google_user.uid) return;
    const userRef = db.collection('users').doc(google_user.uid);
    userRef.get().then((doc) => {
      if (doc.exists) {
        dispatch({
          type: actionTypes.SET_USER,
          value: doc.data()
        });
      } else {
        userRef
          .set({
            email: google_user.email,
            google_uid: google_user.uid,
            name: google_user.displayName,
            photoURL: google_user.photoURL,
            rooms: []
          })
          .then(() =>
            dispatch({
              email: google_user.email,
              google_uid: google_user.uid,
              name: google_user.displayName,
              photoURL: google_user.photoURL,
              rooms: []
            })
          )
          .catch((err) => console.log(err));
      }
    });
  }, [google_user]);

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
            <Route
              path='/invite/:id'
              exact
              render={(routerProps) => (
                <Invite roomId={routerProps.match.params.id} />
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

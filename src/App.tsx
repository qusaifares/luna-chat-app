import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import Home from './components/Home/Home';
import SideNav from './components/SideNav/SideNav';
import Sidebar from './components/Sidebar/Sidebar';
import Chat from './components/Chat/Chat';
import Login from './components/Login/Login';
import Invite from './components/Invite/Invite';

import { ActionType } from './store/reducer';
import { useStateValue } from './store/StateProvider';
import db, { auth } from './firebase';

import './App.css';

const App = () => {
  const [{ user, google_user, darkMode }, dispatch] = useStateValue();
  const theme = createMuiTheme({
    palette: {
      type: darkMode ? 'dark' : 'light'
    }
  });

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      dispatch({
        type: ActionType.SET_GOOGLE_USER,
        value: authUser
      });
    });
  }, []);

  useEffect(() => {
    if (!google_user || !google_user.uid) return;
    const userRef = db.collection('users').doc(google_user.uid);
    userRef.get().then((doc) => {
      if (doc.exists) {
        dispatch({
          type: ActionType.SET_USER,
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
    <ThemeProvider theme={theme}>
      <div className={`app ${darkMode && 'app-dark'}`}>
        {user ? (
          <>
            <SideNav />
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
          </>
        ) : (
          <Login />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;

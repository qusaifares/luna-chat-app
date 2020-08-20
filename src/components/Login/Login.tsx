import React, { useEffect } from 'react';
import { Button } from '@material-ui/core';

import db, { auth, provider } from '../../firebase';

import { useStateValue } from '../../store/StateProvider';
import { actionTypes } from '../../store/reducer';

import './Login.css';

interface Props {}

const Login: React.FC<Props> = (props) => {
  const [{ google_user }, dispatch] = useStateValue();

  const signIn = (): void => {
    auth
      .signInWithPopup(provider)
      .then((result) => {
        dispatch({
          type: actionTypes.SET_GOOGLE_USER,
          value: result.user
        });
        const userRef = db.collection('users').doc(result?.user?.uid);
        userRef.get().then((userDoc) => {
          if (userDoc.exists) {
            dispatch({
              type: actionTypes.SET_USER,
              value: userDoc.data()
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
      })
      .catch((err) => console.error(err.message));
  };
  return (
    <div className='login'>
      <div className='login__container'>
        <img
          src={
            'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg'
          }
          alt='WhatsApp Logo'
        />
        <div className='login__text'>
          <h1>Sign in to WhatsApp</h1>
        </div>
        <Button onClick={signIn}>Sign In With Google</Button>
      </div>
    </div>
  );
};

export default Login;

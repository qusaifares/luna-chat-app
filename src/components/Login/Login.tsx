import React, { useEffect } from 'react';
import { Button, SvgIcon } from '@material-ui/core';
import { Person } from '@material-ui/icons';

import db, { auth, provider } from '../../firebase';

import { useStateValue } from '../../store/StateProvider';
import { ActionType } from '../../store/reducer';

import './Login.css';

import GoogleLogo from './GoogleLogo';

enum LoginMethod {
  Google,
  Anonymous
}

interface Props {}

const Login: React.FC<Props> = (props) => {
  const [{ user, google_user }, dispatch] = useStateValue();

  const signIn = async (method: LoginMethod): Promise<void> => {
    try {
      let result: firebase.auth.UserCredential;
      switch (method) {
        case LoginMethod.Google:
          result = await auth.signInWithPopup(provider);
          break;
        case LoginMethod.Anonymous:
          result = await auth.signInAnonymously();
          if (!result.user?.displayName)
            result.user?.updateProfile({ displayName: 'Guest' });
          break;
      }
      dispatch({
        type: ActionType.SET_GOOGLE_USER,
        value: result.user
      });

      const userRef = db.collection('users').doc(result?.user?.uid);
      userRef.get().then((userDoc) => {
        if (userDoc.exists) {
          dispatch({
            type: ActionType.SET_USER,
            value: userDoc.data()
          });
        } else {
          userRef
            .set({
              email: result?.user?.email,
              google_uid: result?.user?.uid,
              name: result?.user?.displayName || 'Guest',
              photoURL: result?.user?.photoURL,
              rooms: []
            })
            .then(() =>
              dispatch({
                type: ActionType.SET_USER,
                value: {
                  email: result?.user?.email,
                  google_uid: result?.user?.uid,
                  name: result?.user?.displayName,
                  photoURL: result?.user?.photoURL,
                  rooms: []
                }
              })
            )
            .catch((err) => console.log(err));
        }
      });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className='login'>
      <div className='login__container'>
        <img
          src={`${process.env.PUBLIC_URL}/images/chat_logo.png`}
          alt='ChatApp Logo'
        />
        <div className='login__text'>
          <h1>Sign in to Luna</h1>
        </div>
        <div className='login__actions'>
          <Button
            onClick={() => signIn(LoginMethod.Google)}
            startIcon={
              <SvgIcon>
                <GoogleLogo />
              </SvgIcon>
            }
          >
            <p>Sign In With Google</p>
          </Button>

          <Button
            onClick={() => signIn(LoginMethod.Anonymous)}
            startIcon={<Person />}
          >
            <p>Sign In As Guest</p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;

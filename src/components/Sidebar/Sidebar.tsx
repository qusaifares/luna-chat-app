import React, { useState, useEffect, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';
import FlipMove from 'react-flip-move';

import {
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import {
  DonutLarge,
  GroupAdd,
  MoreVert,
  SearchOutlined,
  ArrowBack,
  FiberManualRecord
} from '@material-ui/icons';

import SidebarChat from '../SidebarChat/SidebarChat';
import Profile from '../Profile/Profile';
import IconContainer from '../IconContainer/IconContainer';
import SideNav from '../SideNav/SideNav';
import SideDrawer from '../SideDrawer/SideDrawer';

import { useStateValue } from '../../store/StateProvider';
import { actionTypes } from '../../store/reducer';

import db, { auth } from '../../firebase';
import firebase from 'firebase';

import './Sidebar.css';
export enum DrawerType {
  Profile = 'Profile'
}

interface Room {
  id: string;
  data: firebase.firestore.DocumentData;
}

interface Props {}

const Sidebar: React.FC<Props> = () => {
  let history = useHistory();
  const [
    { user, google_user, drawerOpen, sideDrawer },
    dispatch
  ] = useStateValue();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [optionsAnchor, setOptionsAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [searchInput, setSearchInput] = useState<string>('');

  useEffect(() => {
    setFilteredRooms(
      rooms.filter((room) =>
        room.data.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  }, [rooms, searchInput]);

  useEffect(() => {
    // Returns unsubscribe value
    if (!google_user.uid) return;

    const unsubscribe = db
      .collection('users')
      .doc(google_user.uid)
      .onSnapshot((snapshot) => {
        // returns ids of rooms
        const res = snapshot
          ?.data()
          ?.rooms?.map(
            (
              room: firebase.firestore.QueryDocumentSnapshot<
                firebase.firestore.DocumentData
              >
            ) => room.id
          );
        if (res) setRoomIds(res);
      });

    // Cleanup on dismount
    return () => {
      unsubscribe();
    };
  }, [google_user.uid]);

  useEffect(() => {
    if (!roomIds.length) return;

    const unsubscribe = db
      .collection('rooms')
      .where(firebase.firestore.FieldPath.documentId(), 'in', roomIds)
      .onSnapshot((snapshot) => {
        const tempRooms = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data()
        }));

        setRooms(
          tempRooms.sort(
            (a, b) => b.data.lastMessageTimestamp - a.data.lastMessageTimestamp
          )
        );
      });
    return () => {
      unsubscribe();
    };
  }, [roomIds]);

  const signOut = (): void => {
    auth.signOut().then(() => {
      dispatch({ type: actionTypes.SET_USER, value: null });
      dispatch({ type: actionTypes.SET_GOOGLE_USER, value: null });
      history.push('/');
    });
  };

  const createChat = (): void => {
    if (!user) return;
    const roomName = prompt('Please enter a name for the chat.')?.trim();
    if (!roomName) return;

    const userRef = db.collection('users').doc(user.google_uid);

    db.collection('rooms')
      .add({
        name: roomName,
        members: [userRef],
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then((roomRef) => {
        userRef
          .update({
            rooms: firebase.firestore.FieldValue.arrayUnion(roomRef)
          })
          .then(() => history.push(`/rooms/${roomRef.id}`))
          .catch((err) => console.log(err));
      });
  };

  return (
    <div className='sidebar' id='sidebar'>
      <div className='sidebar__body'>
        <div className='sidebar__header'>
          <div className='sidebar__headerRight'>
            <IconContainer tooltip='Create Group Chat'>
              <IconButton onClick={createChat}>
                <GroupAdd />
              </IconButton>
            </IconContainer>
            <IconButton
              onClick={(e) => setOptionsAnchor(e.currentTarget)}
              aria-controls='sidebar__optionsMenu'
            >
              <MoreVert />
            </IconButton>
            <Menu
              id='sidebar__optionsMenu'
              open={!!optionsAnchor}
              anchorEl={optionsAnchor}
              getContentAnchorEl={null}
              onClose={() => setOptionsAnchor(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
            >
              <MenuItem onClick={signOut}>Sign Out</MenuItem>
            </Menu>
          </div>
        </div>
        <div className='sidebar__search'>
          <div className='sidebar__searchContainer'>
            <SearchOutlined />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type='text'
              placeholder='Search conversations'
            />
          </div>
        </div>
        <div className='sidebar__chats'>
          {/* <SidebarChat addNewChat /> */}
          <FlipMove>
            {filteredRooms.map((room) => (
              <SidebarChat key={room.id} room={room.data} id={room.id} />
            ))}
          </FlipMove>
        </div>
        <SideDrawer open={drawerOpen}>
          <Toolbar className='sidebar__drawerHeader'>
            <IconButton
              onClick={() =>
                dispatch({ type: actionTypes.SET_DRAWER_OPEN, value: false })
              }
              edge='start'
              color='inherit'
              aria-label='back'
            >
              <ArrowBack />
            </IconButton>
            <Typography variant='h6'>{sideDrawer}</Typography>
          </Toolbar>
          {sideDrawer === DrawerType.Profile && <Profile />}
        </SideDrawer>
      </div>
    </div>
  );
};

export default Sidebar;

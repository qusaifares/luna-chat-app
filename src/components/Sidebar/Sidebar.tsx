import React, { useState, useEffect, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';

import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  AppBar,
  Toolbar,
  Typography
} from '@material-ui/core';
import {
  DonutLarge,
  Chat,
  MoreVert,
  SearchOutlined,
  ArrowBack
} from '@material-ui/icons';
import SidebarChat from '../SidebarChat/SidebarChat';
import Profile from '../Profile/Profile';

import { useStateValue } from '../../store/StateProvider';
import { actionTypes } from '../../store/reducer';

import db, { auth } from '../../firebase';
import firebase from 'firebase';

import './Sidebar.css';
interface Room {
  id: string;
  data: firebase.firestore.DocumentData;
}
interface Props {}

const Sidebar: React.FC<Props> = () => {
  let history = useHistory();
  const [{ user, google_user }, dispatch] = useStateValue();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [optionsAnchor, setOptionsAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [searchInput, setSearchInput] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

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

        setRooms(tempRooms);
      });
    return () => {
      unsubscribe();
    };
  }, [roomIds]);

  const toggleDrawer = (): void => {
    setOptionsAnchor(null);
    setDrawerOpen(!drawerOpen);
  };

  const signOut = (): void => {
    auth.signOut().then(() => {
      dispatch({ type: actionTypes.SET_USER, value: null });
      dispatch({ type: actionTypes.SET_GOOGLE_USER, value: null });
      history.push('/');
    });
  };

  return (
    <div className='sidebar' id='sidebar'>
      <div className='sidebar__header'>
        <Avatar src={user?.photoURL} />
        <div className='sidebar__headerRight'>
          <IconButton>
            <DonutLarge />
          </IconButton>
          <IconButton>
            <Chat />
          </IconButton>
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
              horizontal: 'center'
            }}
          >
            <MenuItem onClick={toggleDrawer}>Profile</MenuItem>
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
            placeholder='Search or start new chat'
          />
        </div>
      </div>
      <div className='sidebar__chats'>
        <SidebarChat addNewChat />
        {rooms
          .filter((room) => room.data.name.includes(searchInput))
          .map((room) => (
            <SidebarChat key={room.id} room={room.data} id={room.id} />
          ))}
      </div>
      <Drawer
        anchor='left'
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ style: { position: 'absolute', width: '100%' } }}
        BackdropProps={{ invisible: true, style: { position: 'absolute' } }}
        ModalProps={{
          container: document.getElementById('sidebar'),
          style: { position: 'absolute' }
        }}
      >
        <Toolbar
          className={`sidebar__drawerHeader ${
            drawerOpen && 'sidebar__drawerHeader-open'
          }`}
        >
          <IconButton
            onClick={() => setDrawerOpen(false)}
            edge='start'
            color='inherit'
            aria-label='back'
          >
            <ArrowBack />
          </IconButton>
          <Typography variant='h6'>Profile</Typography>
        </Toolbar>
        <Profile />
      </Drawer>
    </div>
  );
};

export default Sidebar;

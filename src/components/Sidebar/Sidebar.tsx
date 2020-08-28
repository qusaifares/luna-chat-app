import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import FlipMove from 'react-flip-move';

import {
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@material-ui/core';
import {
  GroupAdd,
  MoreVert,
  SearchOutlined,
  ArrowBack,
  ExitToApp,
  Brightness3
} from '@material-ui/icons';

import SidebarChat from '../SidebarChat/SidebarChat';
import Profile from '../Profile/Profile';
import IconContainer from '../IconContainer/IconContainer';
import SideDrawer from '../SideDrawer/SideDrawer';

import { useStateValue } from '../../store/StateProvider';
import { ActionType } from '../../store/reducer';

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
    { user, drawerOpen, sideDrawer, darkMode, rooms },
    dispatch
  ] = useStateValue();
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [optionsAnchor, setOptionsAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [searchInput, setSearchInput] = useState<string>('');
  const [signOutDialog, setSignOutDialog] = useState<boolean>(false);
  const [createGroupDialog, setCreateGroupDialog] = useState<boolean>(false);
  const [groupNameInput, setGroupNameInput] = useState<string>('');

  const changeGroupNameInput = (value: string) => {
    if (value.length > 20) return;
    setGroupNameInput(value);
  };

  useEffect(() => {
    setFilteredRooms(
      rooms.filter((room: firebase.firestore.DocumentData) =>
        room.data.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  }, [rooms, searchInput]);

  useEffect(() => {
    // Returns unsubscribe value
    if (!user.google_uid) return;

    const unsubscribe = db
      .collection('users')
      .doc(user.google_uid)
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
  }, [user]);

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

        dispatch({
          type: ActionType.SET_ROOMS,
          value: tempRooms.sort(
            (a, b) => b.data.lastMessageTimestamp - a.data.lastMessageTimestamp
          )
        });
      });
    return () => {
      unsubscribe();
    };
  }, [roomIds]);

  const signOut = (): void => {
    setSignOutDialog(false);
    auth.signOut().then(() => {
      dispatch({ type: ActionType.SET_USER, value: null });
      dispatch({ type: ActionType.SET_GOOGLE_USER, value: null });
      history.push('/');
    });
  };

  const createGroup = (): void => {
    if (!user) return;
    if (!groupNameInput) return;

    const userRef = db.collection('users').doc(user.google_uid);

    db.collection('rooms')
      .add({
        name: groupNameInput.trim(),
        members: [userRef],
        lastMessageTimestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then((roomRef) => {
        userRef
          .update({
            rooms: firebase.firestore.FieldValue.arrayUnion(roomRef)
          })
          .then(() => {
            setCreateGroupDialog(false);
            history.push(`/rooms/${roomRef.id}`);
          })
          .catch((err) => {
            setCreateGroupDialog(false);
            console.log(err);
          });
      });
  };

  return (
    <div className='sidebar' id='sidebar'>
      <div className='sidebar__body'>
        <div className='sidebar__header'>
          <div className='sidebar__headerRight'>
            <IconContainer tooltip='Create Group Chat'>
              <IconButton onClick={() => setCreateGroupDialog(true)}>
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
              <MenuItem
                onClick={() =>
                  dispatch({
                    type: ActionType.SET_DARK_MODE,
                    value: !darkMode
                  })
                }
              >
                <Brightness3 />
                <Typography>Dark Mode</Typography>
                <Switch checked={darkMode} />
              </MenuItem>
              <MenuItem onClick={() => setSignOutDialog(true)}>
                <ExitToApp />
                <Typography>Sign Out</Typography>
              </MenuItem>
            </Menu>
            {/* Create group dialog box */}
            <Dialog
              open={createGroupDialog}
              onClose={() => setCreateGroupDialog(false)}
              fullWidth
              maxWidth='xs'
            >
              <DialogTitle>Create Group Chat</DialogTitle>
              <DialogContent>
                <TextField
                  value={groupNameInput}
                  onChange={(e) => changeGroupNameInput(e.target.value)}
                  placeholder='Group Name'
                  fullWidth
                  required
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setCreateGroupDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createGroup}>Create</Button>
              </DialogActions>
            </Dialog>
            {/* Sign out dialog box */}
            <Dialog
              open={signOutDialog}
              onClose={() => setSignOutDialog(false)}
            >
              <DialogContent>Are you sure you want to sign out?</DialogContent>
              <DialogActions>
                <Button onClick={() => setSignOutDialog(false)}>No</Button>
                <Button onClick={signOut}>Yes</Button>
              </DialogActions>
            </Dialog>
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
                dispatch({ type: ActionType.SET_DRAWER_OPEN, value: false })
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

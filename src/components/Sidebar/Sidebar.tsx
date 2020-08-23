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
  Chat,
  MoreVert,
  SearchOutlined,
  ArrowBack,
  FiberManualRecord
} from '@material-ui/icons';

import {
  Theme,
  makeStyles,
  withStyles,
  createStyles
} from '@material-ui/core/styles';
import SidebarChat from '../SidebarChat/SidebarChat';
import Profile from '../Profile/Profile';
import IconContainer from '../IconContainer/IconContainer';

import { useStateValue } from '../../store/StateProvider';
import { actionTypes } from '../../store/reducer';

import db, { auth } from '../../firebase';
import firebase from 'firebase';

import './Sidebar.css';
enum DrawerType {
  Profile = 'Profile'
}
enum Status {
  Online = 'online',
  Away = 'away',
  Offline = 'offline'
}
interface Room {
  id: string;
  data: firebase.firestore.DocumentData;
}
interface Props {}

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 'fit-content',
      width: 'fit-content'
    },
    badge: {
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: -1,
        left: -1,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        content: '""'
      }
    }
  })
)(Badge);

const Sidebar: React.FC<Props> = () => {
  let history = useHistory();
  const [{ user, google_user }, dispatch] = useStateValue();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [optionsAnchor, setOptionsAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [statusAnchor, setStatusAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [searchInput, setSearchInput] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerTitle, setDrawerTitle] = useState<string>('');
  const [status, setStatus] = useState<Status>(Status.Online);

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

  const toggleDrawer = (drawerName: DrawerType): void => {
    setOptionsAnchor(null);
    if (!drawerName) {
      setDrawerTitle('');
      setDrawerOpen(false);
    } else {
      setDrawerTitle(drawerName);
      setDrawerOpen(!drawerOpen);
    }
  };
  const cleanupDrawer = (): void => {
    if (!drawerOpen) {
      setDrawerTitle('');
    }
  };

  const signOut = (): void => {
    auth.signOut().then(() => {
      dispatch({ type: actionTypes.SET_USER, value: null });
      dispatch({ type: actionTypes.SET_GOOGLE_USER, value: null });
      history.push('/');
    });
  };

  const createChat = (): void => {
    if (!user) return;
    const roomName = prompt('Please enter a name for the chat.');
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

  const changeStatus = (statusClicked: Status) => {
    setStatusAnchor(null);
    setStatus(statusClicked);
  };

  return (
    <div className='sidebar' id='sidebar'>
      <div className='sidebar__header'>
        <StyledBadge
          overlap='circle'
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          variant='dot'
          className={`${status}Background ${
            status === Status.Online && 'sidebar__avatarBadgeRipple'
          }`}
        >
          <Avatar
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            src={user?.photoURL}
          />
        </StyledBadge>
        <Menu
          id='sidebar__statusMenu'
          open={!!statusAnchor}
          anchorEl={statusAnchor}
          getContentAnchorEl={null}
          onClose={() => setStatusAnchor(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
        >
          <MenuItem onClick={() => changeStatus(Status.Online)}>
            <ListItemIcon>
              <FiberManualRecord fontSize='small' className='onlineColor' />
            </ListItemIcon>
            <ListItemText>Online</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => changeStatus(Status.Away)}>
            <ListItemIcon>
              <FiberManualRecord fontSize='small' className='awayColor' />
            </ListItemIcon>
            <ListItemText>Away</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => changeStatus(Status.Offline)}>
            <ListItemIcon>
              <FiberManualRecord fontSize='small' className='offlineColor' />
            </ListItemIcon>
            <ListItemText>Invisible</ListItemText>
          </MenuItem>
        </Menu>
        <div className='sidebar__headerRight'>
          <IconContainer tooltip='Create Group Chat'>
            <IconButton onClick={createChat}>
              <Chat />
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
            <MenuItem onClick={() => toggleDrawer(DrawerType.Profile)}>
              Profile
            </MenuItem>
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
        {/* <SidebarChat addNewChat /> */}
        <FlipMove>
          {filteredRooms.map((room) => (
            <SidebarChat key={room.id} room={room.data} id={room.id} />
          ))}
        </FlipMove>
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
        onTransitionEnd={cleanupDrawer}
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
          <Typography variant='h6'>{drawerTitle}</Typography>
        </Toolbar>
        {drawerTitle === DrawerType.Profile && <Profile />}
      </Drawer>
    </div>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import {
  Chat,
  Person,
  Contacts,
  Settings,
  FiberManualRecord
} from '@material-ui/icons';
import {
  Theme,
  makeStyles,
  withStyles,
  createStyles
} from '@material-ui/core/styles';

import SideNavItem from '../SideNavItem/SideNavItem';

import { DrawerType } from '../Sidebar/Sidebar';

import { useStateValue } from '../../store/StateProvider';
import { actionTypes } from '../../store/reducer';

import './SideNav.css';

enum Status {
  Online = 'online',
  Away = 'away',
  Offline = 'offline'
}

interface Props {}

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 'fit-content',
      width: 'fit-content'
    },
    badge: {
      boxShadow: `0 0 0 2px #2b1d3f`,
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

const SideNav: React.FC<Props> = () => {
  const [{ user, sideDrawer, drawerOpen }, dispatch] = useStateValue();

  const [status, setStatus] = useState<Status>(Status.Online);
  const [statusAnchor, setStatusAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const changeStatus = (statusClicked: Status) => {
    setStatusAnchor(null);
    setStatus(statusClicked);
  };

  const toggleDrawer = (drawerName: DrawerType | null): void => {
    if (drawerName) {
      dispatch({ type: actionTypes.SET_SIDE_DRAWER, value: drawerName });
    }
    dispatch({ type: actionTypes.SET_DRAWER_OPEN, value: !!drawerName });
  };
  useEffect(() => {
    setTimeout(() => {
      if (!drawerOpen)
        dispatch({ type: actionTypes.SET_SIDE_DRAWER, value: null });
    }, 100);
  }, [drawerOpen]);
  return (
    <div className='sideNav'>
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
      <SideNavItem
        Icon={Chat}
        active={!sideDrawer}
        onClick={() => toggleDrawer(null)}
      />
      <SideNavItem
        Icon={Person}
        active={sideDrawer === DrawerType.Profile}
        onClick={() => toggleDrawer(DrawerType.Profile)}
      />
    </div>
  );
};

export default SideNav;

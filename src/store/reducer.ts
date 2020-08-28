import { DrawerType } from '../components/Sidebar/Sidebar';

interface State {
  user: object | null;
  google_user: firebase.auth.UserCredential | null;
  sideDrawer: DrawerType | null;
  drawerOpen: boolean;
  darkMode: boolean;
  rooms: firebase.firestore.DocumentData[];
}

export const initialState: State = {
  user: null,
  google_user: null,
  sideDrawer: null,
  drawerOpen: false,
  darkMode: false,
  rooms: []
};

export enum ActionType {
  SET_USER = 'SET_USER',
  SET_GOOGLE_USER = 'SET_GOOGLE_USER',
  SET_SIDE_DRAWER = 'SET_SIDE_DRAWER',
  SET_DRAWER_OPEN = 'SET_DRAWER_OPEN',
  SET_DARK_MODE = 'SET_DARK_MODE',
  SET_ROOMS = 'SET_ROOMS'
}

interface Action {
  type: ActionType;
  value: any;
}

const reducer = (state: State, action: Action): State => {
  console.log(action);
  switch (action.type) {
    case ActionType.SET_USER:
      return {
        ...state,
        user: action.value
      };
    case ActionType.SET_GOOGLE_USER:
      return {
        ...state,
        google_user: action.value
      };
    case ActionType.SET_SIDE_DRAWER:
      return {
        ...state,
        sideDrawer: action.value
      };
    case ActionType.SET_DRAWER_OPEN:
      return {
        ...state,
        drawerOpen: action.value
      };
    case ActionType.SET_DARK_MODE:
      return {
        ...state,
        darkMode: action.value
      };
    case ActionType.SET_ROOMS:
      return {
        ...state,
        rooms: action.value
      };
    default:
      return state;
  }
};

export default reducer;

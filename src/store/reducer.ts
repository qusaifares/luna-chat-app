import { DrawerType } from '../components/Sidebar/Sidebar';

interface State {
  user: object | null;
  google_user: object | null;
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

export const actionTypes = {
  SET_USER: 'SET_USER',
  SET_GOOGLE_USER: 'SET_GOOGLE_USER',
  SET_SIDE_DRAWER: 'SET_SIDE_DRAWER',
  SET_DRAWER_OPEN: 'SET_DRAWER_OPEN',
  SET_DARK_MODE: 'SET_DARK_MODE',
  SET_ROOMS: 'SET_ROOMS'
};

interface Action {
  type: string;
  value: any;
}

const reducer = (state: State, action: Action) => {
  console.log(action);
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.value
      };
    case actionTypes.SET_GOOGLE_USER:
      return {
        ...state,
        google_user: action.value
      };
    case actionTypes.SET_SIDE_DRAWER:
      return {
        ...state,
        sideDrawer: action.value
      };
    case actionTypes.SET_DRAWER_OPEN:
      return {
        ...state,
        drawerOpen: action.value
      };
    case actionTypes.SET_DARK_MODE:
      return {
        ...state,
        darkMode: action.value
      };
    case actionTypes.SET_ROOMS:
      return {
        ...state,
        rooms: action.value
      };
    default:
      return state;
  }
};

export default reducer;

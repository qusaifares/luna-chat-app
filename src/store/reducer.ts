interface State {
  user: object | null;
  google_user: object | null;
}

export const initialState: State = {
  user: null,
  google_user: null
};

export const actionTypes = {
  SET_USER: 'SET_USER',
  SET_GOOGLE_USER: 'SET_GOOGLE_USER'
};

interface Action {
  type: string;
  value: any;
}

const reducer = (state: any, action: Action) => {
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
    default:
      return state;
  }
};

export default reducer;

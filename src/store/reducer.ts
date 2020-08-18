interface State {
  user: object | null;
}

export const initialState = {
  user: null
};

export const actionTypes = {
  SET_USER: 'SET_USER'
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
    default:
      return state;
  }
};

export default reducer;

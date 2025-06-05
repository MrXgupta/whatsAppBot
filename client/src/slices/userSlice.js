import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    _id: null,
    name: '',
    email: '',
    token: '',
    isAuthenticated: false,
    isConnected: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginUser: (state, action) => {
            const { _id, name, email, token } = action.payload;
            state._id = _id;
            state.name = name;
            state.email = email;
            state.token = token;
            state.isAuthenticated = true;
        },
        logoutUser: (state) => {
            state._id = null;
            state.name = '';
            state.email = '';
            state.token = '';
            state.isAuthenticated = false;
            state.isConnected = false;
        },
        setConnectionStatus: (state, action) => {
            state.isConnected = action.payload;
        }
    }
});

export const { loginUser, logoutUser, setConnectionStatus } = userSlice.actions;
export default userSlice.reducer;

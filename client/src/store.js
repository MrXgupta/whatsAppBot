import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import userReducer from './slices/userSlice';

const loadState = () => {
    try {
        const app = JSON.parse(localStorage.getItem('app'));
        const user = JSON.parse(localStorage.getItem('user'));
        return {
            app: app || undefined,
            user: user || undefined,
        };
    } catch (e) {
        console.error('Could not load state', e);
        return undefined;
    }
};

const saveState = (state) => {
    try {
        localStorage.setItem('app', JSON.stringify(state.app));
        localStorage.setItem('user', JSON.stringify(state.user));
    } catch (e) {
        console.error('Could not save state', e);
    }
};

const preloadedState = loadState();

export const store = configureStore({
    reducer: {
        app: appReducer,
        user: userReducer
    },
    preloadedState,
});

store.subscribe(() => {
    saveState(store.getState());
});

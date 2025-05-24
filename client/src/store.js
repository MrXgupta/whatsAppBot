import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('app');
        if (serializedState === null) return undefined;
        return { app: JSON.parse(serializedState) };
    } catch (e) {
        console.error('Could not load state', e);
        return undefined;
    }
};

const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state.app);
        localStorage.setItem('app', serializedState);
    } catch (e) {
        console.error('Could not save state', e);
    }
};

const preloadedState = loadState();

export const store = configureStore({
    reducer: {
        app: appReducer,
    },
    preloadedState,
});

store.subscribe(() => {
    saveState(store.getState());
});

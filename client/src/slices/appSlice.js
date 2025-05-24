import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    numbers: [],
    message: '',
    logs: { success: [], failed: [] },
    qr: '',
    clientReady: false,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setNumbers: (state, action) => {
            state.numbers = action.payload;
        },
        addNumber: (state, action) => {
            state.numbers.push(action.payload);
        },
        updateStatus: (state, action) => {
            const { number, status } = action.payload;
            const index = state.numbers.findIndex(n => n.number === number);
            if (index >= 0) state.numbers[index].status = status;
        },
        setMessage: (state, action) => {
            state.message = action.payload;
        },
        setLogs: (state, action) => {
            state.logs = action.payload;
        },
        updateLogs: (state, action) => {
            const { number, status, error } = action.payload;
            if (status === 'success') state.logs.success.push(number);
            if (status === 'failed') state.logs.failed.push({ number, error });
        },
        setQr: (state, action) => {
            state.qr = action.payload;
        },
        setClientReady: (state, action) => {
            state.clientReady = action.payload;
        },
    },
});

export const {
    setNumbers, addNumber, updateStatus, setMessage,
    setLogs, updateLogs, setQr, setClientReady
} = appSlice.actions;

export default appSlice.reducer;

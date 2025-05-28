import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import {useSelector, useDispatch} from 'react-redux';
import {
    updateStatus, updateLogs, setQr, setClientReady
} from '../slices/appSlice.js';
import Logs from "../Components/Logs.jsx"
const socket = io('http://localhost:3000');

const Dashboard = () => {
    const dispatch = useDispatch();
    const {logs} = useSelector(state => state.app);
    const [loadingQr, setLoadingQr] = useState(false);

    useEffect(() => {
        socket.on('qr', qrCode => {
            dispatch(setQr(qrCode));
            dispatch(setClientReady(false));
            setLoadingQr(false);
        });

        socket.on('ready', () => {
            dispatch(setClientReady(true));
            dispatch(setQr(''));
            Swal.fire({icon: 'success', title: 'Connected', text: 'WhatsApp client is ready!'});
        });

        socket.on('log', ({number, status, error}) => {
            dispatch(updateStatus({number, status}));
            dispatch(updateLogs({number, status, error}));
        });

        return () => {
            socket.off('qr');
            socket.off('ready');
            socket.off('log');
        };
    }, [dispatch]);


    return (
        <>
            <h1 className="text-3xl font-bold mb-6">WhatsApp Bulk Sender</h1>
            <div className="flex gap-6">
                <Logs logs={logs}/>
            </div>
        </>
    );
}

export default Dashboard;

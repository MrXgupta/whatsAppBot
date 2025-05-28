import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import {
    setNumbers, addNumber, updateStatus, setMessage,
    setLogs, updateLogs, setQr, setClientReady
} from '../slices/appSlice';
import { handleReconnect, handleFileUpload, handleAddNumber, handleSend } from './Functions';
import QR from './Qr';
import Logs from "./Logs.jsx"
import DataInput from './DataInput.jsx'
import Template from './Template.jsx'
import PreviewTable from "./PreviewTable.jsx";
import DelayConfig from "./DelayConfig.jsx";

const socket = io('http://localhost:3000');

const Dashboard = () => {
    const dispatch = useDispatch();
    const { numbers, message, logs, qr, clientReady } = useSelector(state => state.app);
    const [loadingQr, setLoadingQr] = useState(false);
    const [sending, setSending] = useState(false);
    const [minDelay, setMinDelay] = useState(35);
    const [maxDelay, setMaxDelay] = useState(50);
    const fileRef = useRef();

    useEffect(() => {
        socket.on('qr', qrCode => {
            dispatch(setQr(qrCode));
            dispatch(setClientReady(false));
            setLoadingQr(false);
        });

        socket.on('ready', () => {
            dispatch(setClientReady(true));
            dispatch(setQr(''));
            Swal.fire({ icon: 'success', title: 'Connected', text: 'WhatsApp client is ready!' });
        });

        socket.on('log', ({ number, status, error }) => {
            dispatch(updateStatus({ number, status }));
            dispatch(updateLogs({ number, status, error }));
        });

        return () => {
            socket.off('qr');
            socket.off('ready');
            socket.off('log');
        };
    }, [dispatch]);


    return (
        <div className="p-6 max-w-7xl mx-auto flex gap-6">
            <div className="w-2/3">
                <h1 className="text-3xl font-bold mb-6">WhatsApp Bulk Sender</h1>

                <DataInput
                    fileRef={fileRef}
                    handleFileUpload={(e) => handleFileUpload(e, dispatch)}
                    handleAddNumber={(e) => handleAddNumber(e, dispatch, numbers)}
                />

                <DelayConfig
                    minDelay={minDelay}
                    maxDelay={maxDelay}
                    setMinDelay={setMinDelay}
                    setMaxDelay={setMaxDelay}
                />

                <Template
                    message={message}
                    setMessage={setMessage}
                    dispatch={dispatch}
                    handleSend={() => handleSend(dispatch, numbers, message, setSending, minDelay, maxDelay)}
                    sending={sending}
                />

                <PreviewTable numbers={numbers} />

            </div>

            <div className="w-1/3">
                <QR
                    loadingQr={loadingQr}
                    qr={qr}
                    clientReady={clientReady}
                    handleReconnect={() => handleReconnect(setLoadingQr)}
                />

                <Logs logs={logs} />
            </div>
        </div>
    );
}

export default Dashboard;

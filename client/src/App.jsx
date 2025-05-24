import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import QRCode from 'react-qr-code';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import {
    setNumbers, addNumber, updateStatus, setMessage,
    setLogs, updateLogs, setQr, setClientReady
} from './slices/appSlice';

const socket = io('http://localhost:3000');

export default function App() {
    const dispatch = useDispatch();
    const { numbers, message, logs, qr, clientReady } = useSelector(state => state.app);
    const [loadingQr, setLoadingQr] = useState(false);
    const [sending, setSending] = useState(false);

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

    const handleReconnect = async () => {
        try {
            setLoadingQr(true);
            const res = await axios.post('http://localhost:3000/restart-client');
            Swal.fire({ icon: 'success', title: 'Client Restarted', text: res.data.message });
        } catch (err) {
            setLoadingQr(false);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to restart client' });
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const lines = event.target.result.split(/\r\n|\n/);
            const parsed = lines.filter(Boolean).map(num => ({ number: num.trim(), status: '' }));
            dispatch(setNumbers(parsed));
        };
        reader.readAsText(file);
    };

    const handleAddNumber = (e) => {
        e.preventDefault();
        const number = e.target.number.value.trim();
        if (!number) return Swal.fire({ icon: 'error', title: 'Error', text: 'Number is required' });
        if (!/^[0-9]{12}$/.test(number)) return Swal.fire({ icon: 'error', title: 'Invalid Number', text: 'Enter 12-digit number incl. country code' });
        if (numbers.find(n => n.number === number)) return Swal.fire({ icon: 'warning', title: 'Duplicate', text: 'Number already exists' });

        dispatch(addNumber({ number, status: '' }));
        e.target.reset();
    };

    const handleSend = async () => {
        if (!message.trim()) return Swal.fire({ icon: 'error', title: 'Error', text: 'Message cannot be empty' });
        if (!numbers.length) return Swal.fire({ icon: 'error', title: 'Error', text: 'Add numbers first' });

        dispatch(setLogs({ success: [], failed: [] }));
        dispatch(setNumbers(numbers.map(n => ({ ...n, status: '' }))));
        setSending(true);

        try {
            await axios.post('http://localhost:3000/send', {
                numbers: numbers.map(n => n.number),
                message
            });
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to send messages' });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto flex gap-6">
            <div className="w-2/3">
                <h1 className="text-3xl font-bold mb-6">WhatsApp Bulk Sender</h1>

                <div className="mb-4">
                    <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="border p-2 w-full rounded" />
                </div>

                <form onSubmit={handleAddNumber} className="flex gap-4 mb-4">
                    <input name="number" className="border p-2 flex-1 rounded" placeholder="Enter number with country code" />
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Add</button>
                </form>

                <textarea
                    className="border w-full p-2 mb-4 rounded"
                    rows="4"
                    value={message}
                    onChange={e => dispatch(setMessage(e.target.value))}
                    placeholder="Type your message here"
                ></textarea>

                <div className="border rounded p-4 bg-gray-50 mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">📄 Message Preview</h3>
                    <div className="whitespace-pre-line text-gray-800">{message || 'Your message preview will appear here...'}</div>
                </div>


                <button
                    onClick={handleSend}
                    disabled={sending}
                    className={`px-6 py-2 rounded text-white ${sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600'}`}
                >
                    {sending ? 'Sending...' : 'Send Message'}
                </button>

                <div className="mt-6 max-h-64 overflow-auto border p-4 rounded">
                    <h2 className="text-lg font-semibold mb-2">Preview ({numbers.length} numbers)</h2>
                    <table className="w-full text-left text-sm">
                        <thead>
                        <tr>
                            <th className="py-1 border-b">Number</th>
                            <th className="py-1 border-b">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {numbers.map(({ number, status }, i) => (
                            <tr key={i}>
                                <td className="py-1 border-b">{number}</td>
                                <td className={`py-1 border-b ${status === 'success' ? 'text-green-600' : status === 'failed' ? 'text-red-600' : ''}`}>{status || '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="w-1/3">
                <h2 className="text-2xl font-bold mb-4">QR / Logs</h2>

                {loadingQr && <p className="text-gray-500 mb-4">Loading QR Code...</p>}

                {qr && !clientReady && !loadingQr && (
                    <div className="mb-4">
                        <QRCode value={qr} />
                        <p className="text-gray-500 mt-2">Scan QR Code</p>
                    </div>
                )}

                {clientReady && <p className="text-green-600 font-semibold mb-4">✅ Client is Ready</p>}

                <button onClick={handleReconnect} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
                    Reconnect / Get QR
                </button>

                <div className="border rounded p-4 max-h-64 overflow-auto">
                    <h3 className="text-green-600 font-bold mb-2">✅ Success ({logs.success.length})</h3>
                    <ul className="text-sm list-disc ml-4">
                        {logs.success.map((num, i) => <li key={i}>{num}</li>)}
                    </ul>
                </div>

                <div className="border rounded p-4 mt-4 max-h-64 overflow-auto">
                    <h3 className="text-red-600 font-bold mb-2">❌ Failed ({logs.failed.length})</h3>
                    <ul className="text-sm list-disc ml-4">
                        {logs.failed.map(({ number, error }, i) => <li key={i}>{number} - {error}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
}

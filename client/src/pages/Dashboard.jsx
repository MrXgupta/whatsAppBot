import React, { useEffect, useState, useMemo } from 'react';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import {
    updateStatus,
    updateLogs,
    setQr,
    setClientReady
} from '../slices/appSlice.js';
import axios from 'axios';
import LinkedAccount from '../Components/LinkedAccount';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const socket = io('http://localhost:3000');

const Dashboard = () => {
    const dispatch = useDispatch();
    const { logs } = useSelector(state => state.app);
    const [campaignStats, setCampaignStats] = useState([]);
    const [totalSent, setTotalSent] = useState(0);
    const [totalFailed, setTotalFailed] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        socket.on('log', ({ number, status, error, progress }) => {
            dispatch(updateStatus({ number, status }));
            dispatch(updateLogs({ number, status, error }));
            if (progress) setProgress(progress.toFixed(0));
        });
    }, []);

    useEffect(() => {
        socket.on('qr', qrCode => {
            dispatch(setQr(qrCode));
            dispatch(setClientReady(false));
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

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('http://localhost:3000/campaign-stats');
                setCampaignStats(data.campaigns || []);
                setTotalSent(data.totalSent || 0);
                setTotalFailed(data.totalFailed || 0);
            } catch (err) {
                console.error('Error fetching campaign stats:', err);
            }
        };
        fetchStats();
    }, []);

    const exportCsv = () => {
        const headers = ['Campaign Name,Sent,Failed\n'];
        const rows = campaignStats.map(c =>
            `${c.campaignName},${c.sent},${c.failed}`
        );
        const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'campaign-report.csv';
        a.click();
    };

    const groupedByDate = useMemo(() => {
        const map = {};
        campaignStats.forEach(c => {
            const date = c.sentAt?.split('T')[0];
            if (!map[date]) map[date] = { sent: 0, failed: 0 };
            map[date].sent += c.sent;
            map[date].failed += c.failed;
        });
        return Object.entries(map).map(([date, stats]) => ({ date, ...stats }));
    }, [campaignStats]);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">📊 WhatsApp Report Dashboard</h1>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-sm text-gray-600">Message by month</h2>
                    <div className="text-xl font-bold">{totalSent + totalFailed}/50000</div>
                    <div className="w-full bg-gray-200 h-2 mt-2 rounded">
                        <div className="bg-green-500 h-2 rounded" style={{ width: `${(totalSent + totalFailed) / 50000 * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-sm text-gray-600">Total message sent</h2>
                    <div className="text-xl font-bold text-green-600">{totalSent} Messages</div>
                </div>
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-sm text-gray-600">Total failed</h2>
                    <div className="text-xl font-bold text-red-500">{totalFailed} Messages</div>
                </div>
            </div>

            <div className="bg-white shadow rounded p-4 mt-4">
                <h2 className="text-sm text-gray-600 mb-2">📬 Current Sending Progress</h2>
                <div className="w-full bg-gray-200 h-3 rounded">
                    <div className="bg-indigo-600 h-3 rounded transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm mt-1">{progress}% complete</p>
            </div>

            {groupedByDate.length > 0 && (
                <div className="bg-white p-4 rounded shadow mt-6">
                    <h3 className="text-lg font-semibold mb-4">📊 Messaging Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={groupedByDate}>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                            <Line type="monotone" dataKey="sent" stroke="#22c55e" />
                            <Line type="monotone" dataKey="failed" stroke="#ef4444" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="bg-white p-4 rounded shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">📦 Bulk Messaging Overview</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <h4 className="text-sm text-gray-600">Total</h4>
                        <p className="text-xl font-bold">{totalSent + totalFailed}</p>
                    </div>
                    <div>
                        <h4 className="text-sm text-gray-600">Sent</h4>
                        <p className="text-xl font-bold text-green-600">{totalSent}</p>
                    </div>
                    <div>
                        <h4 className="text-sm text-gray-600">Failed</h4>
                        <p className="text-xl font-bold text-red-500">{totalFailed}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded shadow max-h-64 overflow-y-auto">
                <div className="flex justify-between items-baseline mx-3 ">
                <h3 className="text-lg font-semibold mb-4">📋 Recent Campaigns</h3>
                <button
                    onClick={exportCsv}
                    className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    ⬇️ Export CSV
                </button>
                </div>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-left">Campaign Name</th>
                        <th className="p-2 text-left">Sent</th>
                        <th className="p-2 text-left">Failed</th>
                        <th className="p-2 text-left">Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {campaignStats.slice(0, 5).map((campaign, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{campaign.campaignName}</td>
                            <td className="p-2 text-green-600">{campaign.sent}</td>
                            <td className="p-2 text-red-500">{campaign.failed}</td>
                            <td className="p-2">{new Date(campaign.sentAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <LinkedAccount/>
        </div>
    );
};

export default Dashboard;

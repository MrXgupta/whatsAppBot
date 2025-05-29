// ✅ Enhanced Dashboard UI Based on WhatsApp Analytics Reference
import React, { useEffect, useState } from 'react';
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

const socket = io('http://localhost:3000');

const Dashboard = () => {
    const dispatch = useDispatch();
    const { logs } = useSelector(state => state.app);
    const [campaignStats, setCampaignStats] = useState([]);
    const [totalSent, setTotalSent] = useState(0);
    const [totalFailed, setTotalFailed] = useState(0);

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

            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-4">📋 Campaign Breakdown</h3>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-left">Campaign Name</th>
                        <th className="p-2 text-left">Sent</th>
                        <th className="p-2 text-left">Failed</th>
                    </tr>
                    </thead>
                    <tbody>
                    {campaignStats.map((campaign, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{campaign.campaignName}</td>
                            <td className="p-2 text-green-600">{campaign.sent}</td>
                            <td className="p-2 text-red-500">{campaign.failed}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;

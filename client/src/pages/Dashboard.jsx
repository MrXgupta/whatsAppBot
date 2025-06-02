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
import { subDays, subMonths, isAfter, isBefore, parseISO } from 'date-fns';
import Loader from '../Components/Loader';

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

const Dashboard = () => {
    const dispatch = useDispatch();
    const { logs } = useSelector(state => state.app);
    const [campaignStats, setCampaignStats] = useState([]);
    const [totalSent, setTotalSent] = useState(0);
    const [totalFailed, setTotalFailed] = useState(0);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [botStats, setBotStats] = useState({})
    const [selectedRange, setSelectedRange] = useState('28days');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });


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
            setLoading(false);
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/campaign-stats`);
                setCampaignStats(data.campaigns || []);
                setTotalSent(data.totalSent || 0);
                setTotalFailed(data.totalFailed || 0);
                setLoading(true);
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
        const now = new Date();
        let filtered = [];

        if (selectedRange === '28days') {
            const startDate = subDays(now, 28);
            filtered = campaignStats.filter(c => parseISO(c.sentAt) >= startDate);
        } else if (selectedRange === '3months') {
            const startDate = subMonths(now, 3);
            filtered = campaignStats.filter(c => parseISO(c.sentAt) >= startDate);
        } else if (selectedRange === 'custom' && customRange.start && customRange.end) {
            const start = new Date(customRange.start);
            const end = new Date(customRange.end);
            filtered = campaignStats.filter(c => {
                const date = parseISO(c.sentAt);
                return date >= start && date <= end;
            });
        } else {
            filtered = campaignStats;
        }

        const map = {};
        filtered.forEach(c => {
            const date = c.sentAt?.split('T')[0];
            if (!map[date]) map[date] = { sent: 0, failed: 0 };
            map[date].sent += c.sent;
            map[date].failed += c.failed;
        });

        return Object.entries(map)
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [campaignStats, selectedRange, customRange]);




    useEffect(() => {
        const fetchBotStats = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/chatbotStats`);
                if (res.data.success) {
                    setBotStats(res.data.stats);
                }
            } catch (err) {
                console.error('Error fetching chatbot stats:', err);
            } finally {
                setLoading(true);
            }
        };

        fetchBotStats();
    }, []);

    const filterByDateRange = (data, range) => {
        const now = new Date();
        let startDate;

        if (range === '28days') {
            startDate = subDays(now, 28);
        } else if (range === '3months') {
            startDate = subMonths(now, 3);
        } else if (range?.start && range?.end) {
            startDate = new Date(range.start);
            const endDate = new Date(range.end);
            return data.filter(c => {
                const date = parseISO(c.sentAt);
                return isAfter(date, startDate) && isBefore(date, endDate);
            });
        }

        return data.filter(c => isAfter(parseISO(c.sentAt), startDate));
    };

    return (
        <>
        {loading ? (
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

            <div className="m-4 flex flex-col items-end">
                <div className="flex items-center  gap-4 mb-4">
                    <select
                        className="border p-2 rounded"
                        value={selectedRange}
                        onChange={(e) => setSelectedRange(e.target.value)}
                    >
                        <option value="28days">Last 28 Days</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {selectedRange === 'custom' && (
                        <div className="flex gap-2">
                            <input
                                type="date"
                                className="border p-2 rounded"
                                value={customRange.start}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                            <input
                                type="date"
                                className="border p-2 rounded"
                                value={customRange.end}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                    )}
                </div>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={groupedByDate}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 14, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 14, fontWeight: 600 }} />
                    <Tooltip
                        contentStyle={{ fontWeight: "bold", backgroundColor: "#f9fafb", border: "1px solid #ddd" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="sent"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="failed"
                        stroke="#dc2626"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            </div>



            <div className="bg-white p-4 rounded shadow my-6">
                <h3 className="text-lg font-semibold mb-4">🤖 Bot Replies Overview</h3>
                {loading ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <h4 className="text-sm text-gray-600">Total</h4>
                            <p className="text-xl font-bold">{botStats.total}</p>
                        </div>
                        <div>
                            <h4 className="text-sm text-gray-600">Successful</h4>
                            <p className="text-xl font-bold text-green-600">{botStats.sent}</p>
                        </div>
                        <div>
                            <h4 className="text-sm text-gray-600">Failed</h4>
                            <p className="text-xl font-bold text-red-500">{botStats.failed}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">Loading stats...</div>
                )}
            </div>

            <div className="bg-white p-4 rounded shadow my-6">
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
        </div>) : (<Loader/>)}
        </>
    );
};

export default Dashboard;

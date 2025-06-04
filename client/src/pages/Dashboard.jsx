import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import {useSelector, useDispatch} from 'react-redux';
import {updateStatus, updateLogs, setQr, setClientReady} from '../slices/appSlice.js';
import axios from 'axios';
import LinkedAccount from '../Components/Profile/LinkedAccount.jsx';
import Charts from '../Components/Dashboard/Charts.jsx';
import Loader from '../Components/Loader';
import CampaignStats from "../Components/Campaign/CampaignStats.jsx";
import Overview from "../Components/Dashboard/Overview.jsx";
import Pie from "../Components/Dashboard/Pie.jsx";
import gsap from 'gsap';
import SuccessRatePie from "../Components/Dashboard/SuccessRatePie.jsx";

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

const Dashboard = () => {
    const user = useSelector(state => state.user);
    console.log(user);
    const dispatch = useDispatch();
    const {logs} = useSelector(state => state.app);
    const [campaignStats, setCampaignStats] = useState([]);
    const [totalSent, setTotalSent] = useState(0);
    const [totalFailed, setTotalFailed] = useState(0);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [botStats, setBotStats] = useState({})
    const [selectedRange, setSelectedRange] = useState('28days');
    const [customRange, setCustomRange] = useState({start: '', end: ''});

    useEffect(() => {
        if (loading) {
            gsap.from(".dashboard-title", {opacity: 0, y: -30, duration: 0.6});
            gsap.from(".dashboard-stats-box", {opacity: 0, y: 20, duration: 0.6, stagger: 0.2, delay: 0.3});
            gsap.from(".dashboard-pie-chart", {opacity: 0, scale: 0.8, duration: 0.8, delay: 0.6});
            gsap.from(".dashboard-charts", {opacity: 0, y: 30, duration: 0.6, delay: 0.8});
            gsap.from(".dashboard-overview", {opacity: 0, y: 30, duration: 0.6, delay: 1});
            gsap.from(".dashboard-campaigns", {opacity: 0, y: 30, duration: 0.6, delay: 1.2});
            gsap.from(".dashboard-link", {opacity: 0, y: 30, duration: 0.6, delay: 1.4});
        }
    }, [loading]);


    useEffect(() => {
        socket.on('log', ({number, status, error, progress}) => {
            dispatch(updateStatus({number, status}));
            dispatch(updateLogs({number, status, error}));
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

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(false);
            try {
                const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/campaign-stats`, {
                    userId: user._id,
                });
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

    useEffect(() => {
        const fetchBotStats = async () => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/chatbotStats`, {
                    userId: user._id,
                });
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

    return (
        <>
            {loading ? (
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6 dashboard-title">📊 WhatsApp Report Dashboard</h1>

                    <div className="grid grid-cols-3 gap-6 items-start mb-6 dashboard-stats-box">
                        {/* Left column (2/3) */}
                        <div className="col-span-2 flex flex-col gap-6">
                            {/* Stats Tiles */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white shadow rounded-2xl p-4">
                                    <h2 className="text-sm text-gray-600">Message by month</h2>
                                    <div className="text-xl font-bold">{totalSent + totalFailed}/50000</div>
                                    <div className="w-full bg-gray-200 h-2 mt-2 rounded">
                                        <div
                                            className="bg-green-500 h-2 rounded"
                                            style={{ width: `${(totalSent + totalFailed) / 50000 * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="bg-white shadow rounded-2xl p-4">
                                    <h2 className="text-sm text-gray-600">Total message sent</h2>
                                    <div className="text-xl font-bold text-green-600">{totalSent} Messages</div>
                                </div>
                                <div className="bg-white shadow rounded-2xl p-4">
                                    <h2 className="text-sm text-gray-600">Total failed</h2>
                                    <div className="text-xl font-bold text-red-500">{totalFailed} Messages</div>
                                </div>
                            </div>

                            {/* Bottom Pie chart (Left) */}
                            <div className="bg-white shadow rounded-2xl p-4">
                            <Pie progress={progress} />
                            </div>
                        </div>

                        {/* Right-side Large Pie chart */}
                        <div className="bg-white shadow rounded-2xl p-4 h-full flex items-center justify-center">
                                <SuccessRatePie totalSent={totalSent} totalFailed={totalFailed} loading={loading} />
                        </div>
                    </div>



                    <div className="dashboard-charts">
                        <Charts selectedRange={selectedRange} setSelectedRange={setSelectedRange}
                                customRange={customRange} setCustomRange={setCustomRange}/>
                    </div>

                    <div className="dashboard-overview">
                        <Overview botStats={botStats} totalSent={totalSent} totalFailed={totalFailed} loading={loading}/>
                    </div>

                    <div className="dashboard-campaigns">
                        <CampaignStats/>
                    </div>

                    <div className="dashboard-link">
                        <LinkedAccount/>
                    </div>
                </div>
            ) : (
                <Loader/>
            )}
        </>
    );
};

export default Dashboard;
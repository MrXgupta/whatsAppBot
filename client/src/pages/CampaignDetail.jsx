import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../Components/Loader';
import CampaignPreview from '../Components/Campaign/CampaignPreview.jsx';
import { Undo2 } from "lucide-react";

const CampaignDetail = () => {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/campaign/${id}`)
            .then(res => {
                if (res.data.success) {
                    setCampaign(res.data.data);
                }
            })
            .catch(err => {
                console.error('Failed to fetch campaign:', err);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Loader />;
    if (!campaign) return <div className="p-4 text-red-600 text-center">Campaign not found</div>;

    const successLogs = campaign.logs.filter(log => log.status === 'success');
    const failedLogs = campaign.logs.filter(log => log.status === 'failed');
    const successRate = Math.round((successLogs.length / campaign.logs.length) * 100);

    return (
        <div className="w-full min-h-screen bg-gray-100 p-6">
            <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex gap-2 items-baseline">
                    <button onClick={()=>history.back()}><Undo2/></button>
                    <h1 className="text-3xl font-bold mb-4">Campaign Overview</h1>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-lg">
                        <div><strong>Campaign Name:</strong> <span className="uppercase font-semibold">{campaign.campaignName}</span></div>
                        <div><strong>Group:</strong> <Link to={`/contacts/${campaign.groupId}`} className="text-blue-600 underline">{campaign.groupName}</Link></div>
                        <div><strong>Message:</strong> {campaign.message}</div>
                        <div><strong>Total Contacts:</strong> {campaign.totalContacts}</div>
                        <div><strong>Status:</strong> <span className={`font-bold ${campaign.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{campaign.status.toUpperCase()}</span></div>
                        <div><strong>Sent At:</strong> {new Date(campaign.sentAt).toLocaleString()}</div>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-2">Success Rate</h2>
                    <div className="w-full bg-gray-300 rounded-full h-4 mb-2">
                        <div
                            className="bg-green-500 h-4 rounded-full"
                            style={{ width: `${successRate}%` }}
                        ></div>
                    </div>
                    <p className="mb-6 text-sm text-gray-600">{successRate}% delivered successfully</p>

                    <h2 className="text-2xl font-bold mt-8 mb-4">Logs Summary</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
                            <h3 className="font-semibold text-green-700">Success ({successLogs.length})</h3>
                            <div className="overflow-y-auto max-h-64">
                                {successLogs.map(log => (
                                    <div key={log._id} className="text-sm text-green-800 font-mono border-b py-1">
                                        ✓ {log.number}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded">
                            <h3 className="font-semibold text-red-700">Failed ({failedLogs.length})</h3>
                            <div className="overflow-y-auto max-h-64">
                                {failedLogs.map(log => (
                                    <div key={log._id} className="text-sm text-red-800 font-mono border-b py-1">
                                        ✗ {log.number}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mt-8 mb-2">Full Logs</h2>
                    <div className="bg-black text-white font-mono text-sm rounded-md p-4 overflow-auto max-h-[50vh]">
                        {campaign.logs.map((log, index) => (
                            <div key={log._id} className={`py-1 border-b border-gray-700 ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                [{index + 1}] {log.status.toUpperCase()} - {log.number} {log.error && `\n  Error: ${log.error}`}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <CampaignPreview message={campaign.message} mediaFile={campaign.mediaFile ? { name: 'Media', path: campaign.mediaFile } : null} />
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;

import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {setMessage} from "../slices/appSlice";
import Template from "../components/Template";
import {handleSend} from "../Components/Functions.js"
import axios from "axios";
import Swal from "sweetalert2";
import Loader from "../components/loader";

const Campaigns = () => {
    const dispatch = useDispatch();
    const [showForm, setShowForm] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [selectedContactGroup, setSelectedContactGroup] = useState("");
    const [message, setMessageValue] = useState("");
    const [numbers, setNumbers] = useState([]);
    const [sending, setSending] = useState(false);
    const [minDelay, setMinDelay] = useState(2);
    const [maxDelay, setMaxDelay] = useState(5);
    const [groups, setGroups] = useState([]);
    const [campaignStats, setCampaignStats] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(false);
            try {
                const { data } = await axios.get('http://localhost:3000/campaign-stats');
                setCampaignStats(data.campaigns || []);
                setLoading(true);
            } catch (err) {
                console.error('Error fetching campaign stats:', err);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(false);
            try {
                const {data} = await axios.get("http://localhost:3000/getContacts");
                setGroups(data.groups || []);
                setLoading(true);
            } catch (err) {
                console.error("Failed to fetch groups", err);
            }
        };

        fetchGroups();
    }, []);

    return (
        <>
            {loading ? (

        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">📢 Campaigns</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    {showForm ? "Cancel" : "➕ New Campaign"}
                </button>
            </div>
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-500 transition-all">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Create New Campaign</h3>

                    <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-600">Campaign Name</label>
                        <input
                            type="text"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="E.g. Diwali Promotion"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-600">Select Contact Group</label>
                        <select
                            value={selectedContactGroup}
                            onChange={(e) => setSelectedContactGroup(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="">-- Select Campaign Contacts --</option>
                            {groups.map((g) => (
                                <option key={g._id} value={g._id}>
                                    {g.groupName} ({g.numbers.length} contacts)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">Min Delay (sec)</label>
                            <input
                                type="number"
                                value={minDelay}
                                onChange={(e) => setMinDelay(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded"
                                min={1}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-600">Max Delay (sec)</label>
                            <input
                                type="number"
                                value={maxDelay}
                                onChange={(e) => setMaxDelay(Number(e.target.value))}
                                className="w-full px-3 py-2 border rounded"
                                min={1}
                            />
                        </div>
                    </div>

                    <Template
                        message={message}
                        setMessage={setMessageValue}
                        dispatch={dispatch}
                        sending={sending}
                        campaignName={campaignName}
                        selectedContactGroup={selectedContactGroup}
                        minDelay={minDelay}
                        maxDelay={maxDelay}
                        setSending={setSending}
                    />
                </div>
            )}

            <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-4">📋 Campaign Breakdown</h3>
                <table className="w-full text-sm">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 text-left">Campaign Name</th>
                        <th className="p-2 text-left">Sent</th>
                        <th className="p-2 text-left">Failed</th>
                        <th className="p-2 text-left">Date / Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {campaignStats.map((campaign, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{campaign.campaignName}</td>
                            <td className="p-2 text-green-600">{campaign.sent}</td>
                            <td className="p-2 text-red-500">{campaign.failed}</td>
                            <td className="p-2 text-gray-700">
                                {new Date(campaign.sentAt).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
            ) : (<Loader/>)}
        </>
    );
};

export default Campaigns;

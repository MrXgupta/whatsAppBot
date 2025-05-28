import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setMessage } from "../slices/appSlice";
import Template from "../components/Template";
import PreviewTable from "../components/PreviewTable";
import axios from "axios";
import Swal from "sweetalert2";

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

    const handleSend = async () => {
        if (!selectedContactGroup || !message.trim()) {
            return Swal.fire({ icon: 'error', title: 'Error', text: 'Please select a contact group and enter a message.' });
        }

        setSending(true);
        console.log(campaignName, selectedContactGroup, message, minDelay, maxDelay);

        try {
            await axios.post('http://localhost:3000/send', {
                campaignId: selectedContactGroup,
                message,
                minDelay,
                maxDelay
            });

            Swal.fire({ icon: 'success', title: 'Message Sent', text: 'Campaign messages sent successfully.' });
        } catch {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to send campaign messages.' });
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await axios.get("http://localhost:3000/getContacts");
                setGroups(data.groups || []);
            } catch (err) {
                console.error("Failed to fetch groups", err);
            }
        };

        fetchGroups();
    }, []);

    return (
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
                        handleSend={handleSend}
                        sending={sending}
                    />
                </div>
            )}

            <div className="my-6">
                <h2 className="text-lg text-gray-700 font-medium mb-2">📜 Previous Campaigns</h2>
                <div className="text-sm text-gray-500">(Campaign list will appear here...)</div>
            </div>
        </div>
    );
};

export default Campaigns;

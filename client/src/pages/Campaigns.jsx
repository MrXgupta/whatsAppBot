import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleSend } from "../Components/Functions.js";
import axios from "axios";
import Loader from "../components/loader";
import CampaignForm from "../components/CampaignForm";
import CampaignPreview from "../components/CampaignPreview";
import CampaignStats from "../components/CampaignStats";

const Campaigns = () => {
    const dispatch = useDispatch();
    const [showForm, setShowForm] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [selectedContactGroup, setSelectedContactGroup] = useState("");
    const [message, setMessageValue] = useState("");
    const [sending, setSending] = useState(false);
    const [minDelay, setMinDelay] = useState(20);
    const [maxDelay, setMaxDelay] = useState(30);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaFile, setMediaFile] = useState(null);


    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(false);
            try {
                const { data } = await axios.get("http://localhost:3000/getContacts");
                setGroups(data.groups || []);
                setLoading(true);
            } catch (err) {
                console.error("Failed to fetch groups", err);
            }
        };

        fetchGroups();
    }, []);

    return loading ? (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-800">📢 Campaigns</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    {showForm ? "Cancel" : "➕ New Campaign"}
                </button>
            </div>

            {showForm && (
                <div className="flex">
                    <CampaignForm
                        campaignName={campaignName}
                        setCampaignName={setCampaignName}
                        selectedContactGroup={selectedContactGroup}
                        setSelectedContactGroup={setSelectedContactGroup}
                        groups={groups}
                        message={message}
                        dispatch={dispatch}
                        setMessageValue={setMessageValue}
                        minDelay={minDelay}
                        maxDelay={maxDelay}
                        setMinDelay={setMinDelay}
                        setMaxDelay={setMaxDelay}
                        mediaFile={mediaFile}
                        setMediaFile={setMediaFile}
                        sending={sending}
                        setSending={setSending}
                        handleSend={handleSend}
                    />
                    <CampaignPreview mediaFile={mediaFile} message={message} />
                </div>
            )}

            <CampaignStats />
        </div>
    ) : (
        <Loader />
    );
};

export default Campaigns;

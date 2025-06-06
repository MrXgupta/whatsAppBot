import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {handleSend} from "../Components/Functions.js";
import axios from "axios";
import Loader from "../Components/Loader";
import CampaignForm from "../Components/Campaign/CampaignForm.jsx";
import CampaignPreview from "../Components/Campaign/CampaignPreview.jsx";
import CampaignStats from "../Components/Campaign/CampaignStats.jsx";

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
    const user = useSelector(state => state.user) || localStorage.getItem('user');
    console.log(user)


    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(false);
            try {
                const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/getContactsSummary`, {
                    userId: user._id,
                });
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
                        user={user}
                    />
                    <CampaignPreview mediaFile={mediaFile} message={message}/>
                </div>
            )}

            <CampaignStats/>
        </div>
    ) : (
        <div className="flex justify-center items-center h-screen w-screen">
            <Loader/>
        </div>
    );
};

export default Campaigns;

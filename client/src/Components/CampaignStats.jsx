import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert2";

const CampaignStats = () => {

    const [campaignStats, setCampaignStats] = useState([]);
    const [refetch , setRefetch] = useState(false)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/campaign-stats`);
                setCampaignStats(data.campaigns || []);
            } catch (err) {
                console.error('Error fetching campaign stats:', err);
            }
        };
        fetchStats();
    }, [refetch]);

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BASE_URL}deleteCampaign/${id}`);
            if(res.status === 200){
                swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    text: 'Campaign deleted successfully'
                })
                setRefetch(!refetch)
            }
        }catch(err){
            console.error('Error deleting campaign:', err);
        }
    }

    return (
        <div className="bg-white p-4 rounded shadow mt-6">
            <h3 className="text-lg font-semibold mb-4">📋 Campaign Breakdown</h3>
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2 text-left">Campaign Name</th>
                    <th className="p-2 text-left">Sent</th>
                    <th className="p-2 text-left">Failed</th>
                    <th className="p-2 text-left">Date / Time</th>
                    <th className="p-2 text-left">Action</th>
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
                        <td className="p-2 flex gap-2">
                            <Link to={`/campaign/${campaign.id}`} className="px-4 py-2 border bg-indigo-400 hover:bg-indigo-500">View</Link>
                            <button className="bg-red-600 text-white py-2 px-4 hover:bg-red-700"
                            onClick={()=>handleDelete(campaign.id)}
                            >Delete</button>

                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CampaignStats;

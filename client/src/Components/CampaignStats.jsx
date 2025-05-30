import React from "react";
import { Link } from "react-router-dom";

const CampaignStats = ({ campaignStats }) => {
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
                        <td className="p-2"><Link to={`/campaign/${campaign.id}`} className="px-4 py-2 border bg-indigo-400 mx-4 hover:bg-indigo-500">View</Link></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CampaignStats;

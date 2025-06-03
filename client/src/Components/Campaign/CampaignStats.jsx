import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert2";

const CampaignStats = () => {
    const [campaignStats, setCampaignStats] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [refetch, setRefetch] = useState(false);
    const [sortBy, setSortBy] = useState("sentAt");
    const [order, setOrder] = useState("desc");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const limit = 10;

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const params = new URLSearchParams({
                    page,
                    limit,
                    sortBy,
                    order,
                    ...(fromDate && { fromDate }),
                    ...(toDate && { toDate }),
                });

                const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/campaign-stats?${params.toString()}`);
                setCampaignStats(data.campaigns || []);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error("Error fetching campaign stats:", err);
            }
        };
        fetchStats();
    }, [page, refetch, sortBy, order, fromDate, toDate]);


    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BASE_URL}/deleteCampaign/${id}`);
            if (res.status === 200) {
                swal.fire({
                    icon: "success",
                    title: "Deleted",
                    text: "Campaign deleted successfully"
                });
                setRefetch(!refetch);
            }
        } catch (err) {
            console.error("Error deleting campaign:", err);
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow mt-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="text-lg font-semibold">📋 Campaign Breakdown</h3>

                <div className="flex flex-wrap gap-2 items-center">
                    <label className="text-sm">From:</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                            setFromDate(e.target.value);
                            setPage(1);
                        }}
                        className="border px-2 py-1 text-sm rounded"
                    />
                    <label className="text-sm">To:</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                            setToDate(e.target.value);
                            setPage(1);
                        }}
                        className="border px-2 py-1 text-sm rounded"
                    />
                    <select
                        className="border px-3 py-2 text-sm rounded"
                        value={`${sortBy}_${order}`}
                        onChange={(e) => {
                            const [newSort, newOrder] = e.target.value.split("_");
                            setSortBy(newSort);
                            setOrder(newOrder);
                            setPage(1);
                        }}
                    >
                        <option value="sentAt_desc">Date (Newest First)</option>
                        <option value="sentAt_asc">Date (Oldest First)</option>
                        <option value="sent_desc">Success (High to Low)</option>
                        <option value="sent_asc">Success (Low to High)</option>
                        <option value="failed_desc">Failed (High to Low)</option>
                        <option value="failed_asc">Failed (Low to High)</option>
                    </select>
                </div>
            </div>

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
                            {campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : "N/A"}
                        </td>
                        <td className="p-2 flex gap-2">
                            <Link
                                to={`/campaign/${campaign.id}`}
                                className="px-4 py-2 border bg-indigo-400 hover:bg-indigo-500 text-white rounded"
                            >
                                View
                            </Link>
                            <button
                                className="bg-red-600 text-white py-2 px-4 hover:bg-red-700 rounded"
                                onClick={() => handleDelete(campaign.id)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-sm">
            Page {page} of {totalPages}
        </span>
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CampaignStats;

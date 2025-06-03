import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Undo2 } from "lucide-react";

const ShowContacts = () => {
    const { id } = useParams();
    const [groupInfo, setGroupInfo] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchContacts = async (type = tab, pageNum = page) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/contacts/${id}?type=${type}&page=${pageNum}&limit=50`);
            setGroupInfo(data.groupInfo);
            setContacts(data.numbers);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch group details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [id, tab, page]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!groupInfo) return <div className="p-6 text-red-600">Group not found.</div>;

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <button onClick={() => history.back()} className="text-gray-600 hover:text-black">
                    <Undo2 />
                </button>
                <h1 className="text-2xl font-semibold">📁 {groupInfo.groupName}</h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <p><strong>📅 Added On:</strong> {new Date(groupInfo.addedAt).toLocaleString()}</p>
                <p><strong>📦 Total Numbers:</strong> {groupInfo.totalContacts}</p>
                <p className="text-green-600"><strong>✅ Valid:</strong> {groupInfo.totalValid}</p>
                <p className="text-red-500"><strong>❌ Invalid:</strong> {groupInfo.totalInvalid}</p>
                <p className="text-red-500"><strong>❌ Duplicate (Removed):</strong> {groupInfo.duplicatesRemoved}</p>
                <p><strong>🔍 Status:</strong> {groupInfo.validationStatus}</p>
            </div>

            <div className="flex gap-4 mb-4">
                {['all', 'valid', 'invalid'].map(t => (
                    <button
                        key={t}
                        onClick={() => { setTab(t); setPage(1); }}
                        className={`px-4 py-2 rounded ${tab === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}
                    >
                        {t === 'all' ? '📋 All Contacts' : t === 'valid' ? '✅ Valid' : '❌ Invalid'}
                    </button>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg overflow-auto">
                <table className="min-w-full text-sm text-left border border-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Phone Number</th>
                        <th className="p-3">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {contacts.map((number, index) => {
                        const isValid = tab === 'valid'
                            ? true
                            : tab === 'invalid'
                                ? false
                                : groupInfo.validNumbers?.some(validNum => String(validNum).trim() === String(number).trim());

                        const colorClass = isValid ? 'text-green-600' : 'text-red-500';
                        const label = isValid ? 'Valid' : 'Invalid';

                        return (
                            <tr key={index} className="border-t">
                                <td className="p-3">{(page - 1) * 10 + index + 1}</td>
                                <td className="p-3 font-mono">{number}</td>
                                <td className={`p-3 font-semibold ${colorClass}`}>{label}</td>
                            </tr>
                        );
                    })}

                    {contacts.length === 0 && (
                        <tr>
                            <td colSpan="3" className="p-4 text-center text-gray-500">No numbers found</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center p-4 border-t">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >Next</button>
                </div>
            </div>
        </div>
    );
};

export default ShowContacts;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Undo2 } from "lucide-react";

const ShowContacts = () => {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("valid");

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const { data } = await axios.get(`http://localhost:3000/contacts/${id}`);
                setGroup(data);
            } catch (error) {
                console.error("Failed to fetch group details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroup();
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!group) return <div className="p-6 text-red-600">Group not found.</div>;

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <button onClick={() => history.back()} className="text-gray-600 hover:text-black">
                    <Undo2 />
                </button>
                <h1 className="text-2xl font-semibold">📁 {group.groupName}</h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <p><strong>📅 Added On:</strong> {new Date(group.addedAt).toLocaleString()}</p>
                <p><strong>📦 Total Numbers:</strong> {group.numbers.length}</p>
                <p className="text-green-600"><strong>✅ Valid:</strong> {group.validNumbers.length}</p>
                <p className="text-red-500"><strong>❌ Invalid:</strong> {group.invalidNumbers.length}</p>
                <p className="text-red-500"><strong>❌ Duplicate (Removed):</strong> {group.duplicatesRemoved}</p>
                <p><strong>🔍 Status:</strong> {group.validationStatus}</p>
            </div>

            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setTab("valid")}
                    className={`px-4 py-2 rounded ${tab === "valid" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"}`}
                >
                    ✅ Valid Numbers
                </button>
                <button
                    onClick={() => setTab("invalid")}
                    className={`px-4 py-2 rounded ${tab === "invalid" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-800"}`}
                >
                    ❌ Invalid Numbers
                </button>
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
                    {(tab === "valid" ? group.validNumbers : group.invalidNumbers).map((number, index) => (
                        <tr key={index} className="border-t">
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3 font-mono">{number}</td>
                            <td className={`p-3 font-semibold ${tab === "valid" ? "text-green-600" : "text-red-500"}`}>
                                {tab === "valid" ? "Valid" : "Invalid"}
                            </td>
                        </tr>
                    ))}
                    {(tab === "valid" ? group.validNumbers.length : group.invalidNumbers.length) === 0 && (
                        <tr>
                            <td colSpan="3" className="p-4 text-center text-gray-500">No numbers found</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShowContacts;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ShowContacts = () => {
    const { id } = useParams();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

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
            <h1 className="text-2xl font-semibold mb-4">📁 {group.groupName}</h1>
            <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-medium mb-3">📋 Contact Numbers</h2>
                <ul className="space-y-2">
                    {group.numbers.map((number, idx) => (
                        <li key={idx} className="border p-2 rounded bg-gray-50">
                            {number}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ShowContacts;

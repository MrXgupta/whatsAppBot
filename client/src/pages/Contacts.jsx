import { handleFileUpload } from "../Components/Functions.js";
import React, { useEffect, useRef, useState } from "react";
import PreviewTable from "../Components/PreviewTable.jsx";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Contacts = () => {
    const fileRef = useRef();
    const { numbers } = useSelector(state => state.app);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [groupName, setGroupName] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [groups, setGroups] = useState([]);

    const handleSaveContacts = async () => {
        const numberList = numbers.map(n => n.number);

        if (!groupName.trim()) {
            return Swal.fire({ icon: 'error', title: 'Missing Group Name', text: 'Please provide a group name.' });
        }
        if (!numberList.length) {
            return Swal.fire({ icon: 'error', title: 'No Contacts', text: 'Please add contacts before saving.' });
        }

        try {
            await axios.post("http://localhost:3000/contacts", {
                groupName,
                numbers: numberList,
            });

            Swal.fire({ icon: 'success', title: 'Contacts Saved', text: 'Group created successfully.' });
            setGroupName("");
            setShowForm(false);
            fetchGroups();
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save contacts.' });
        }
    };

    const fetchGroups = async () => {
        try {
            const { data } = await axios.get("http://localhost:3000/getContacts");
            setGroups(data.groups || []);
        } catch (err) {
            console.error("Failed to fetch groups", err);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">📇 Contact Groups</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    {showForm ? "Cancel" : "➕ Add Contact Group"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white shadow-md rounded p-6 mb-6">
                    <div className="mb-4">
                        <label className="block mb-1 text-sm font-medium text-gray-600">Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="E.g. Holiday Clients"
                        />
                    </div>

                    <div className="mb-6">
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv"
                            className="block w-full mb-2 text-sm text-gray-600"
                            onChange={(e) => handleFileUpload(e, dispatch)}
                        />
                        <p className="text-sm text-gray-500">Upload a CSV file with a column named <code>number</code>.</p>
                    </div>

                    <PreviewTable numbers={numbers} />

                    <button
                        onClick={handleSaveContacts}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Save Group
                    </button>
                </div>
            )}

            <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-800">📁 Your Contact Groups</h2>
                <ul className="divide-y divide-gray-200 bg-white rounded shadow-sm">
                    {groups.length > 0 ? (
                        groups.map(group => (
                            <li
                                key={group._id}
                                className="p-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => navigate(`/contacts/${group._id}`)}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium text-gray-700">📦 {group.groupName}</span>
                                    <span className="text-sm text-gray-500">{group.numbers.length} contacts</span>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No groups created yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Contacts;

import { handleFileUpload } from "../Components/Functions.js";
import React, { useEffect, useRef, useState } from "react";
import PreviewTable from "../Components/PreviewTable.jsx";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Loader from "../Components/Loader";
const Contacts = () => {
    const fileRef = useRef();
    const { numbers } = useSelector(state => state.app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
            setLoading(false);
            await axios.post("http://localhost:3000/contacts", {
                groupName,
                numbers: numberList,
            });

            Swal.fire({ icon: 'success', title: 'Contacts Saved', text: 'Group created successfully.' });
            setGroupName("");
            setShowForm(false);
            setLoading(true)
            fetchGroups();
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save contacts.' });
        }
    };

    const fetchGroups = async () => {
        setLoading(false);
        try {
            const { data } = await axios.get("http://localhost:3000/getContacts");
            setGroups(data.groups || []);
            setLoading(true)
        } catch (err) {
            console.error("Failed to fetch groups", err);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <>
            {loading ? (
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
                <table className="w-full text-sm mt-4">
                    <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="p-2">Group</th>
                        <th className="p-2">Valid</th>
                        <th className="p-2">Invalid</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {groups.map((g) => (
                        <tr key={g._id} className="border-b"
                            onClick={() => navigate(`/contacts/${g._id}`)}
                        >
                            <td className="p-2 font-semibold">{g.groupName}</td>
                            <td className="p-2 text-green-600">{g.validNumbers.length}</td>
                            <td className="p-2 text-red-500">{g.invalidNumbers.length}</td>
                            <td className="p-2">{g.validationStatus}</td>
                            <td className="p-2">{new Date(g.addedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
        </div>
            </div> ) : (<Loader/>)}
    </>
    );
};

export default Contacts;

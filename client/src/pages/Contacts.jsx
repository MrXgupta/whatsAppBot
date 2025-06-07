import {handleFileUpload} from "../Components/Functions.js";
import React, {useEffect, useRef, useState} from "react";
import PreviewTable from "../Components/Contacts/PreviewTable.jsx";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import Loader from "../Components/Loader";

const Contacts = () => {
    const fileRef = useRef();
    const {numbers} = useSelector(state => state.app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [groups, setGroups] = useState([]);
    const [previewNumbers, setPreviewNumbers] = useState([]);
    const [filePath, setFilePath] = useState('');
    const [fetch, setFetch] = useState(false)
    const user = useSelector(state => state.user);

    const handleSaveContacts = async () => {
        if (!groupName.trim()) {
            return Swal.fire({icon: 'error', title: 'Missing Group Name', text: 'Please provide a group name.'});
        }

        if (!filePath) {
            return Swal.fire({icon: 'error', title: 'Missing File', text: 'Please upload a CSV file before saving.'});
        }

        try {
            setLoading(true);

            const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/contacts`, {
                groupName,
                filePath,
                userId: user._id,
            });

            setFetch(!fetch)

            Swal.fire({
                icon: 'success',
                title: 'Group Saved',
                text: 'Validation will complete shortly in the background.'
            });

            setGroupName("");
            setFilePath("");
            setShowForm(false);
            fetchGroups();
        } catch (err) {
            console.error(err);
            Swal.fire({icon: 'error', title: 'Error', text: 'Failed to save contacts.'});
        } finally {
            setLoading(false);
        }
    };


    const fetchGroups = async () => {
        setLoading(false);
        try {
            const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/getContacts`, {
                userId: user._id,
            });
            setGroups(data.groups || []);
            setLoading(true)
        } catch (err) {
            console.error("Failed to fetch groups", err);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [fetch]);

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_BASE_URL}/contacts/${id}/${user._id}`);
            Swal.fire({icon: 'success', title: 'Group Deleted', text: 'Group deleted successfully.'});
            setFetch(!fetch)
        } catch (err) {
            console.error(err);
            Swal.fire({icon: 'error', title: 'Error', text: 'Failed to delete group.'});
        }
    }

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

                                <div className="m-4 border-l-4 border-gray-400 pl-4 text-sm mt-6">
                                    <p className="text-sm text-gray-600 mb-2">
                                        📌 <strong>Number Format Rules:</strong><br/>
                                        • Each number must be 12 digits starting with country
                                        code <code>91</code> (e.g. <code>919876543210</code>).<br/>
                                        • Only numeric values are allowed — no spaces, dashes, or text.<br/>
                                        • File should contain a single column titled <code>number</code>.<br/>
                                    </p>

                                    <a
                                        href="../../public/example.csv"
                                        download
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        ⬇️ Download sample CSV template
                                    </a>
                                </div>

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
                                        onChange={(e) => handleFileUpload(e, setPreviewNumbers, setFilePath)}
                                    />
                                    <p className="text-sm text-gray-500">Upload a CSV file with a column
                                        named <code>number</code>.</p>
                                </div>

                                <PreviewTable numbers={previewNumbers}/>

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
                                    <th className="p-2">Duplicate (Removed)</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {groups.map((g) => (
                                    <tr key={g._id} className="border-b hover:bg-gray-100">
                                        <td className="p-2 font-semibold">{g.groupName}</td>
                                        <td className="p-2 text-green-600">{g.validCount}</td>
                                        <td className="p-2 text-red-500">{g.invalidCount}</td>
                                        <td className="p-2 text-red-500">{g.duplicatesRemoved}</td>
                                        <td className="p-2">{g.validationStatus}</td>
                                        <td className="p-2">{new Date(g.addedAt).toLocaleString()}</td>
                                        <td>
                                            <button className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
                                                    onClick={() => navigate(`/contacts/${g._id}`)}
                                            >
                                                View
                                            </button>
                                            <button className="bg-red-600 text-white p-2 rounded hover:bg-red-700 ml-2"
                                                    onClick={() => handleDelete(g._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>) :
                (
                    <div className="flex justify-center items-center h-screen w-screen">
                        <Loader/>
                    </div>
                )
            }
        </>
    );
};

export default Contacts;

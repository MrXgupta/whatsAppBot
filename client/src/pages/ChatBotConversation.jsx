import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChatbotLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('http://localhost:3000/chatbot-conversations');
                if (res.data.success) {
                    setLogs(res.data.conversation);
                    console.log(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch chatbot logs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);


    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">📊 Chatbot Logs</h1>

                {loading ? (
                    <div className="text-center text-gray-500">Loading...</div>
                ) : (
                    logs.length === 0 ? (
                        <div className="text-center text-gray-500">No logs available.</div>
                    ) : (
                        logs.map(convo => (
                            <div key={convo._id} className="bg-white rounded-xl shadow p-5 mb-6">
                                <div className="text-lg font-semibold mb-2 text-blue-600">
                                    📱 User: {convo.number}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left text-gray-700">
                                        <thead className="bg-gray-200 uppercase text-xs font-bold">
                                        <tr>
                                            <th className="px-4 py-3">Query</th>
                                            <th className="px-4 py-3">Response</th>
                                            <th className="px-4 py-3">Timestamp</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {convo.chats.map((chat, idx) => (
                                            <tr key={idx} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-2">{chat.query}</td>
                                                <td className="px-4 py-2">{chat.response}</td>
                                                <td className="px-4 py-2 text-gray-500">
                                                    {formatDate(chat.timestamp)}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default ChatbotLogs;

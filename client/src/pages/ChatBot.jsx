import { useEffect, useState } from 'react';
import axios from 'axios';
import gsap from 'gsap';

const Chatbot = () => {
    const [rules, setRules] = useState([]);
    const [ruleKeyword, setRuleKeyword] = useState('');
    const [response, setResponse] = useState('');
    const [matchType, setMatchType] = useState('exact');

    const [keywordGroups, setKeywordGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [groupKeywords, setGroupKeywords] = useState('');

    const [isBotActive, setIsBotActive] = useState(true);

    const fetchData = async () => {
        const [rulesRes, keywordsRes, statusRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_BASE_URL}/chatbot/rules`),
            axios.get(`${import.meta.env.VITE_BASE_URL}/chatbot/keywords`),
            axios.get(`${import.meta.env.VITE_BASE_URL}/bot/status`)
        ]);
        setRules(rulesRes.data.rules || []);
        setKeywordGroups(keywordsRes.data.groups || []);
        setIsBotActive(statusRes.data?.paused);
        console.log(rulesRes.data, keywordsRes.data, statusRes.data);
    };

    const toggleBotStatus = async () => {
        const newStatus = !isBotActive;
        await axios.post(`${import.meta.env.VITE_BASE_URL}/bot/status`, { isActive: newStatus });
        setIsBotActive(newStatus);
    };

    useEffect(() => {
        fetchData();
        gsap.from(".fade-in", { opacity: 0, y: 30, duration: 0.8, stagger: 0.2 });
    }, []);

    const handleSaveRule = async () => {
        if (!ruleKeyword || !response) return alert('Please fill all fields.');
        await axios.post(`${import.meta.env.VITE_BASE_URL}/chatbot/rules`, {
            keyword: ruleKeyword,
            response,
            matchType
        });
        setRuleKeyword('');
        setResponse('');
        setMatchType('exact');
        fetchData();
    };

    const handleSaveKeywordGroup = async () => {
        if (!groupName || !groupKeywords) return alert('Please fill all fields.');
        await axios.post(`${import.meta.env.VITE_BASE_URL}/chatbot/keywords`, {
            groupName,
            keywords: groupKeywords.split(',').map(k => k.trim())
        });
        setGroupName('');
        setGroupKeywords('');
        fetchData();
    };

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-2xl font-bold fade-in">Chatbot Manager</h2>

            <div className="flex items-center space-x-4 fade-in">
                <span className={`text-sm font-medium ${isBotActive ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {isBotActive ? 'Active' : 'Paused'}
                </span>
                <button
                    onClick={toggleBotStatus}
                    className={`px-4 py-2 rounded text-white ${isBotActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {isBotActive ? 'Pause Bot' : 'Resume Bot'}
                </button>
            </div>

            <div className="border p-4 rounded-lg shadow space-y-3 fade-in">
                <h3 className="font-semibold text-lg">Add Chatbot Rule</h3>
                <input
                    type="text"
                    placeholder="Trigger Keyword"
                    value={ruleKeyword}
                    onChange={(e) => setRuleKeyword(e.target.value)}
                    className="border p-2 w-full rounded"
                />
                <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value)}
                    className="border p-2 w-full rounded"
                >
                    <option value="exact">Exact Match</option>
                    <option value="contains">Contains</option>
                    <option value="startsWith">Starts With</option>
                    <option value="endsWith">Ends With</option>
                </select>
                <input
                    type="text"
                    placeholder="Response"
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="border p-2 w-full rounded"
                />
                <button
                    onClick={handleSaveRule}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Save Rule
                </button>
            </div>

            <div className="border p-4 rounded-lg shadow space-y-3 fade-in">
                <h3 className="font-semibold text-lg">Add Keyword Group</h3>
                <input
                    type="text"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="border p-2 w-full rounded"
                />
                <input
                    type="text"
                    placeholder="Keywords (comma-separated)"
                    value={groupKeywords}
                    onChange={(e) => setGroupKeywords(e.target.value)}
                    className="border p-2 w-full rounded"
                />
                <button
                    onClick={handleSaveKeywordGroup}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Save Group
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    <h3 className="text-xl font-semibold bg-gray-100 px-6 py-4 border-b">🤖 All Chatbot Rules</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-200 text-gray-700 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-3">Keyword</th>
                                <th className="px-6 py-3">Match Type</th>
                                <th className="px-6 py-3">Response</th>
                            </tr>
                            </thead>
                            <tbody className="text-gray-700">
                            {rules.map((r, i) => (
                                <tr
                                    key={i}
                                    className="border-t hover:bg-gray-50 transition duration-200"
                                >
                                    <td className="px-6 py-3 font-medium">{r.keyword}</td>
                                    <td className="px-6 py-3 capitalize">{r.matchType}</td>
                                    <td className="px-6 py-3">{r.response}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    <h3 className="text-xl font-semibold bg-gray-100 px-6 py-4 border-b">🧩 All Keyword Groups</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-200 text-gray-700 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-3">Group Name</th>
                                <th className="px-6 py-3">Keywords</th>
                            </tr>
                            </thead>
                            <tbody className="text-gray-700">
                            {keywordGroups.map((g, i) => (
                                <tr
                                    key={i}
                                    className="border-t hover:bg-gray-50 transition duration-200"
                                >
                                    <td className="px-6 py-3 font-semibold">{g.groupName || "Fetching"}</td>
                                    <td className="px-6 py-3">{g.keywords?.join(', ')}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
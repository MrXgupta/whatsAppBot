import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import React, { useEffect, useState } from "react";
import { subDays, subMonths, isAfter, isBefore, parseISO } from "date-fns";
import axios from "axios";

const Charts = ({ selectedRange, setSelectedRange, customRange, setCustomRange }) => {
    const [chartData, setChartData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const fetchCampaignChartStats = async () => {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/campaign-all-stats`);
        return response.data;
    };

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchCampaignChartStats();
            setChartData(data);
        };
        loadData();
    }, []);

    useEffect(() => {
        const now = new Date();
        let result = [];

        if (selectedRange === '28days') {
            const start = subDays(now, 28);
            result = chartData.filter(d => parseISO(d.date) >= start);
        } else if (selectedRange === '3months') {
            const start = subMonths(now, 3);
            result = chartData.filter(d => parseISO(d.date) >= start);
        } else if (selectedRange === 'custom' && customRange.start && customRange.end) {
            const start = new Date(customRange.start);
            const end = new Date(customRange.end);
            result = chartData.filter(d => {
                const date = parseISO(d.date);
                return isAfter(date, start) && isBefore(date, end);
            });
        } else {
            result = chartData;
        }

        setFilteredData(result);
    }, [chartData, selectedRange, customRange]);

    return (
        <div className="m-4 flex flex-col items-end">
            <div className="flex items-center gap-4 mb-4">
                <select
                    className="border p-2 rounded"
                    value={selectedRange}
                    onChange={(e) => setSelectedRange(e.target.value)}
                >
                    <option value="28days">Last 28 Days</option>
                    <option value="3months">Last 3 Months</option>
                    <option value="custom">Custom Range</option>
                </select>

                {selectedRange === 'custom' && (
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={customRange.start}
                            onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={customRange.end}
                            onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                        />
                    </div>
                )}
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredData}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 14, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 14, fontWeight: 600 }} />
                    <Tooltip
                        contentStyle={{ fontWeight: "bold", backgroundColor: "#f9fafb", border: "1px solid #ddd" }}
                    />
                    <Line type="monotone" dataKey="sent" stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }} />
                    <Line type="monotone" dataKey="failed" stroke="#dc2626" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Charts;

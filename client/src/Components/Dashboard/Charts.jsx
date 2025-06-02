import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import React, {useMemo} from "react";
import {isAfter, isBefore, parseISO, subDays, subMonths} from "date-fns";

const Charts = ({selectedRange, setSelectedRange, customRange, setCustomRange , campaignStats}) => {

    const groupedByDate = useMemo(() => {
        const now = new Date();
        let filtered = [];

        if (selectedRange === '28days') {
            const startDate = subDays(now, 28);
            filtered = campaignStats.filter(c => parseISO(c.sentAt) >= startDate);
        } else if (selectedRange === '3months') {
            const startDate = subMonths(now, 3);
            filtered = campaignStats.filter(c => parseISO(c.sentAt) >= startDate);
        } else if (selectedRange === 'custom' && customRange.start && customRange.end) {
            const start = new Date(customRange.start);
            const end = new Date(customRange.end);
            filtered = campaignStats.filter(c => {
                const date = parseISO(c.sentAt);
                return date >= start && date <= end;
            });
        } else {
            filtered = campaignStats;
        }

        const map = {};
        filtered.forEach(c => {
            const date = c.sentAt?.split('T')[0];
            if (!map[date]) map[date] = {sent: 0, failed: 0};
            map[date].sent += c.sent;
            map[date].failed += c.failed;
        });

        return Object.entries(map)
            .map(([date, stats]) => ({date, ...stats}))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [campaignStats, selectedRange, customRange]);

    const filterByDateRange = (data, range) => {
        const now = new Date();
        let startDate;

        if (range === '28days') {
            startDate = subDays(now, 28);
        } else if (range === '3months') {
            startDate = subMonths(now, 3);
        } else if (range?.start && range?.end) {
            startDate = new Date(range.start);
            const endDate = new Date(range.end);
            return data.filter(c => {
                const date = parseISO(c.sentAt);
                return isAfter(date, startDate) && isBefore(date, endDate);
            });
        }

        return data.filter(c => isAfter(parseISO(c.sentAt), startDate));
    };

    return (
        <>
            <div className="m-4 flex flex-col items-end">
                <div className="flex items-center  gap-4 mb-4">
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
                    <LineChart data={groupedByDate}>
                        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 14, fontWeight: 600 }} />
                        <YAxis tick={{ fontSize: 14, fontWeight: 600 }} />
                        <Tooltip
                            contentStyle={{ fontWeight: "bold", backgroundColor: "#f9fafb", border: "1px solid #ddd" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="sent"
                            stroke="#16a34a"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="failed"
                            stroke="#dc2626"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
    )
}

export default Charts;
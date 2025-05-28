import React from 'react';

const DelayConfig = ({ minDelay, maxDelay, setMinDelay, setMaxDelay }) => {
    return (
        <div className="flex gap-4 mb-4">
            <label className="flex flex-col">
                Min Delay (sec)
                <select value={minDelay} onChange={(e) => setMinDelay(Number(e.target.value))}>
                    {[...Array(60)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                </select>
            </label>
            <label className="flex flex-col">
                Max Delay (sec)
                <select value={maxDelay} onChange={(e) => setMaxDelay(Number(e.target.value))}>
                    {[...Array(60)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                </select>
            </label>
        </div>
    );
};

export default DelayConfig;

import React from "react";

const Logs = ({ logs }) => {
    return (
        <>
            <div className="border rounded p-4 max-h-64 overflow-auto">
                <h3 className="text-green-600 font-bold mb-2">✅ Success ({logs?.success?.length || 0})</h3>
                <ul className="text-sm list-disc ml-4">
                    {logs?.success?.map((num, i) => (
                        <li key={i}>{num}</li>
                    ))}
                </ul>
            </div>

            <div className="border rounded p-4 mt-4 max-h-64 overflow-auto">
                <h3 className="text-red-600 font-bold mb-2">❌ Failed ({logs?.failed?.length || 0})</h3>
                <ul className="text-sm list-disc ml-4">
                    {logs?.failed?.map(({ number, error }, i) => (
                        <li key={i}>{number} - {error}</li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default Logs;

import React from "react";

const PreviewTable = ({numbers}) => {
    return (
        <>
            <div className="mt-6 max-h-64 overflow-auto border p-4 rounded">
                <h2 className="text-lg font-semibold mb-2">Preview ({numbers.length} numbers)</h2>
                <table className="w-full text-left text-sm">
                    <thead>
                    <tr>
                        <th className="py-1 border-b">Number</th>
                        <th className="py-1 border-b">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {numbers.map(({ number, status }, i) => (
                        <tr key={i}>
                            <td className="py-1 border-b">{number}</td>
                            <td className={`py-1 border-b ${status === 'success' ? 'text-green-600' : status === 'failed' ? 'text-red-600' : ''}`}>{status || '-'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default PreviewTable;
import React from "react";

const Overview = ({botStats, totalSent, totalFailed, loading}) => {
    return (
        <>
            <div className="bg-white p-6 rounded shadow my-6">
                <h3 className="text-lg font-semibold mb-4">📊 Messaging Overview</h3>
                <div className="grid grid-cols-2 gap-6">

                    {/* Bot Replies */}
                    <div className="border-r-2 ">
                        <h4 className="text-md font-medium mb-2">🤖 Bot Replies</h4>
                        {loading ? (
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <h5 className="text-sm text-gray-600">Total</h5>
                                    <p className="text-xl font-bold">{botStats.total}</p>
                                </div>
                                <div>
                                    <h5 className="text-sm text-gray-600">Successful</h5>
                                    <p className="text-xl font-bold text-green-600">{botStats.sent}</p>
                                </div>
                                <div>
                                    <h5 className="text-sm text-gray-600">Failed</h5>
                                    <p className="text-xl font-bold text-red-500">{botStats.failed}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">Loading stats...</div>
                        )}
                    </div>

                    {/* Bulk Messaging */}
                    <div>
                        <h4 className="text-md font-medium mb-2">📦 Bulk Messaging</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <h5 className="text-sm text-gray-600">Total</h5>
                                <p className="text-xl font-bold">{totalSent + totalFailed}</p>
                            </div>
                            <div>
                                <h5 className="text-sm text-gray-600">Sent</h5>
                                <p className="text-xl font-bold text-green-600">{totalSent}</p>
                            </div>
                            <div>
                                <h5 className="text-sm text-gray-600">Failed</h5>
                                <p className="text-xl font-bold text-red-500">{totalFailed}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Overview;
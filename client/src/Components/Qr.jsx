import QRCode from "react-qr-code";
import React from "react";

const Qr = ({loadingQr, qr, clientReady, handleReconnect}) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4">QR / Logs</h2>

            {loadingQr && <p className="text-gray-500 mb-4">Loading QR Code...</p>}

            {qr && !clientReady && !loadingQr && (
                <div className="mb-4">
                    <QRCode value={qr} />
                    <p className="text-gray-500 mt-2">Scan QR Code</p>
                </div>
            )}

            <button onClick={handleReconnect} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
                Reconnect / Get QR
            </button>

            {clientReady && <p className="text-green-600 font-semibold mb-4">✅ Client is Ready</p>}
        </>
    )
}

export default Qr;
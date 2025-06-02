import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import React from "react";

const Qr = () => {
    const { qr, qrStatus } = useSelector((state) => state.app);

    return (
        <>
            <h2 className="text-2xl font-bold mb-4">QR ~ </h2>

            {qrStatus === "idle" && <p className="text-gray-500">Waiting for QR code...</p>}
            {qrStatus === "loading" && qr && (
                <div className="mb-4">
                    <QRCode value={qr} />
                    <p className="text-gray-500 mt-2">Scan QR Code</p>
                </div>
            )}
            {qrStatus === "scanned" && <p className="text-blue-500">QR Scanned. Connecting...</p>}
            {qrStatus === "ready" && <p className="text-green-600 font-semibold">✅ Connected</p>}
            {qrStatus === "error" && <p className="text-red-600 font-semibold">❌ Connection Error</p>}
        </>
    );
};

export default Qr;

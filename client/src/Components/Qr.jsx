import QRCode from "react-qr-code";
import React from "react";

const Qr = ({loadingQr, qr, clientReady}) => {
    return (
        <>
            <h2 className="text-2xl font-bold mb-4">QR ~ </h2>

            {loadingQr && <p className="text-gray-500 mb-4">Loading QR Code...</p>}
            {qr && !clientReady && !loadingQr && (
                <div className="mb-4">
                    <QRCode value={qr} />
                    <p className="text-gray-500 mt-2">Scan QR Code</p>
                </div>
            )}
            {clientReady && <p className="text-green-600 font-semibold mb-4"> Client is Ready</p>}
        </>
    )
}

export default Qr;
import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const LinkedAccount = () => {
    const [clientInfo, setClientInfo] = useState(null);
    const isLoggedOut = useRef(false);
    useEffect(() => {
        socket.on("client_info", (info) => {
            if (!isLoggedOut.current) {
                setClientInfo(info);
            }
        });
        const fetchClientInfo = async () => {
            if (isLoggedOut.current) return;
            try {
                const {data} = await axios.get("http://localhost:3000/client-info");
                setClientInfo(data);
            } catch (err) {
                console.warn("No cached client info available yet.");
            }
        };

        fetchClientInfo();

        return () => {
            socket.off("client_info");
        };
    }, []);

    const handleLogout = async () => {
        try {
            const { data } = await axios.post("http://localhost:3000/logout");
            if (data.success) {
                isLoggedOut.current = true;
                setClientInfo(null);
                Swal.fire("Logged out", "Please scan the QR again.", "success");
            }
        } catch (err) {
            console.error("Logout failed", err);
            Swal.fire("Error", "Could not logout.", "error");
        }
    };


    return (
        <>
            {clientInfo && (
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">🧾 Linked WhatsApp Details</h3>
                    <div className="flex items-center gap-3 border-2 border-gray-200 p-4 rounded-2xl">
                        <img src={clientInfo.profilePicUrl} alt="Profile" className="w-20 h-20 rounded-full mb-2"/>
                        <div className="flex gap-2 flex-col justify-center">
                            <p><strong>Name:</strong> {clientInfo.name}</p>
                            <p><strong>Number:</strong> {clientInfo.number}</p>
                            <p><strong>Platform:</strong> {clientInfo.platform}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        🔒 Logout WhatsApp
                    </button>

                </div>
            )}
        </>
    )
}

export default LinkedAccount;
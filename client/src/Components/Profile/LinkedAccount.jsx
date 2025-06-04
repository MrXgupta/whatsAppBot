import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import io from "socket.io-client";
import Loader from "../Loader.jsx";
import useClientInfo from "./userClientInfo.js"
import {useSelector} from "react-redux";
import Swal from "sweetalert2";


const LinkedAccount = () => {
    const {clientInfo, setClientInfo} = useClientInfo();
    const isLoggedOut = useRef(false);
    const user = useSelector(state => state.user);
    const handleLogout = async () => {
        try {
            const {data} = await axios.post(`${import.meta.env.VITE_BASE_URL}/logout`, {
                userId: user._id,
            });
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
                        <img src={clientInfo.profilePicUrl} alt="Profile"
                             className="w-20 h-20 rounded-full mb-2"/>
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
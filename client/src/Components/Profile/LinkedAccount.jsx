import React, {useRef, useState} from "react";
import axios from "axios";
import useClientInfo from "./userClientInfo.js"
import {useSelector} from "react-redux";
import Swal from "sweetalert2";


const LinkedAccount = () => {
    const {clientInfo, setClientInfo} = useClientInfo();
    const isLoggedOut = useRef(false);
    const user = useSelector(state => state.user);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);
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

    const openFullscreenImage = () => {
        setIsImageFullscreen(true);
    };

    const closeFullscreenImage = () => {
        setIsImageFullscreen(false);
    };

    return (
        <>
            {clientInfo && (
                <div className="mt-6 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">🧾 Linked WhatsApp Details</h3>
                    <div className="flex items-center gap-3 border-2 border-gray-200 p-4 rounded-2xl">
                        <div className="relative">
                            <img
                                src={clientInfo.profilePicUrl}
                                alt="Profile"
                                className="w-20 h-20 rounded-full mb-2 cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg"
                                onClick={openFullscreenImage}
                            />
                            <div
                                className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100"
                                onClick={openFullscreenImage}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                                </svg>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-col justify-center">
                            <p><strong>Name:</strong> {clientInfo.name}</p>
                            <p><strong>Number:</strong> {clientInfo.number}</p>
                            <p><strong>Platform:</strong> {clientInfo.platform}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200"
                    >
                        🔒 Logout WhatsApp
                    </button>
                </div>
            )}

            {/* Fullscreen Image Modal */}
            {isImageFullscreen && (
                <div
                    className="absolute left-0 inset-0 top-[-60vh] bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fadeIn"
                    onClick={closeFullscreenImage}
                >
                    <div className="relative max-w-4xl max-h-4xl w-full h-full flex items-center justify-center p-4">
                        {/* Close button */}
                        <button
                            onClick={closeFullscreenImage}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-60 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all duration-200"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>

                        {/* Profile Image */}
                        <img
                            src={clientInfo.profilePicUrl}
                            alt="Profile Fullscreen"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scaleIn"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {/* Profile Info Overlay */}
                        <div
                            className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg backdrop-blur-sm">
                            <h3 className="text-xl font-semibold">{clientInfo.name}</h3>
                            <p className="text-sm opacity-90">{clientInfo.number}</p>
                            <p className="text-sm opacity-90">{clientInfo.platform}</p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes scaleIn {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </>

    )
}

export default LinkedAccount;
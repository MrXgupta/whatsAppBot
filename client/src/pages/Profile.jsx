import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import io from "socket.io-client";
import Swal from "sweetalert2";
import {useNavigate} from "react-router-dom";
import QRCode from "react-qr-code";

import LinkedAccount from "../Components/Profile/LinkedAccount.jsx";
import Loader from "../Components/Loader.jsx";

import {setClientReady, setQr, setQrStatus} from "../slices/appSlice.js";
import {setConnectionStatus} from "../slices/userSlice.js";

import {AlertCircle, CheckCircle, RefreshCw, Smartphone, Wifi, WifiOff,} from "lucide-react";

const socketRef = io(import.meta.env.VITE_BASE_URL, {
    transports: ["websocket"],
    autoConnect: false,
});

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {qr, qrStatus} = useSelector((state) => state.app);
    const user = useSelector((state) => state.user);
    const hasInitialized = useRef(false);
    const [initStatus, setInitStatus] = useState("searching");
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [qrScanned, setQrScanned] = useState(false);

    // Initialize socket once
    useEffect(() => {
        if (!socketRef.connected) {
            socketRef.connect();

            socketRef.on("connect", () => {
                console.log("Socket connected");
                console.log("Socket ID:", socketRef);
            });

            socketRef.on("disconnect", () => {
                console.log("Socket disconnected");
            });

            socketRef.on("qr", (qrCode) => {
                dispatch(setQr(qrCode));
                dispatch(setQrStatus("loading"));
                setInitStatus("scanning");
                dispatch(setClientReady(false));
                setQrScanned(false);
                setLoading(false);

                Swal.fire({
                    icon: "info",
                    title: "QR Code Ready",
                    text: "Please scan the QR code with your WhatsApp.",
                    toast: true,
                    position: "top-end",
                    timer: 2500,
                    showConfirmButton: false,
                });
            });

            socketRef.on("authenticated", () => {
                dispatch(setQrStatus("scanned"));
                setInitStatus("connecting");
                setQrScanned(true);

                Swal.fire({
                    icon: "success",
                    title: "QR Scanned Successfully",
                    text: "Connecting to WhatsApp...",
                    toast: true,
                    position: "top-end",
                    timer: 2000,
                    showConfirmButton: false,
                });
            });

            socketRef.on("ready", () => {
                dispatch(setClientReady(true));
                dispatch(setQrStatus("ready"));
                dispatch(setQr(""));
                dispatch(setConnectionStatus(true));
                setInitStatus("ready");

                Swal.fire({
                    icon: "success",
                    title: "WhatsApp Connected!",
                    text: "You can now use the app.",
                    toast: true,
                    position: "top-end",
                    timer: 2000,
                    showConfirmButton: false,
                });

                navigate("/dashboard");
            });

            socketRef.on("auth_failure", (msg) => {
                dispatch(setQrStatus("error"));
                dispatch(setClientReady(false));
                setInitStatus("error");

                Swal.fire({
                    icon: "error",
                    title: "Authentication Failed",
                    text: msg || "WhatsApp authentication failed. Please try again.",
                });
            });

            socketRef.on("disconnected", (reason) => {
                dispatch(setQrStatus("error"));
                dispatch(setClientReady(false));
                setInitStatus("error");

                Swal.fire({
                    icon: "warning",
                    title: "Disconnected",
                    text: reason || "Client was disconnected. Please reconnect.",
                });
            });
        }

        return () => {
            socketRef.off("qr");
            socketRef.off("authenticated");
            socketRef.off("ready");
            socketRef.off("auth_failure");
            socketRef.off("disconnected");
        };
    }, [dispatch, navigate]);

    useEffect(() => {
        if (user._id && !user.isConnected && !hasInitialized.current) {
            hasInitialized.current = true;
            socketRef.emit("join", user._id);
        }
    }, [user._id, user.isConnected]);

    useEffect(() => {
        if (user.isConnected) {
            navigate("/dashboard");
        }
    }, [user.isConnected, navigate]);

    const initSession = async () => {
        if (!user?._id) return;

        setInitStatus("searching");
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/session/init`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({userId: user._id}),
            });

            const data = await res.json();

            if (data.status === "ready") {
                setInitStatus("ready");
                dispatch(setClientReady(true));
                dispatch(setQrStatus("ready"));
                setLoading(false);
                dispatch(setConnectionStatus(true));
                navigate("/dashboard");
            } else if (data.status === "pending") {
                setInitStatus("scanning");
                dispatch(setClientReady(false));
                dispatch(setQrStatus("loading"));
                setLoading(false);
            } else {
                setInitStatus("searching");
                setLoading(false);
            }
        } catch (err) {
            console.error("Session init error:", err);
            setInitStatus("error");
            setLoading(false);

            Swal.fire({
                icon: "error",
                title: "Session Init Failed",
                text: err.message,
            });
        }
    };

    useEffect(() => {
        if (user._id) {
            initSession();
            socketRef.emit("join", user._id);
        }
    }, [user._id]);

    const handleRetry = () => {
        setRetryCount((prev) => prev + 1);
        setInitStatus("searching");
        setLoading(true);
        initSession();
    };

    const getStatusInfo = () => {
        switch (initStatus) {
            case "searching":
                return {
                    title: "Searching for session",
                    description: "Checking for an existing WhatsApp session...",
                    icon: <RefreshCw size={24} className="text-blue-500 animate-spin"/>,
                    loader: <Loader type="spinner" text="Checking session status..." size="md"/>,
                    color: "blue",
                };
            case "scanning":
                return {
                    title: "Scan QR Code",
                    description: "Open WhatsApp > Settings > Linked Devices and scan the code.",
                    icon: <Smartphone size={24} className="text-green-500"/>,
                    loader: qr ? null : <Loader type="whatsapp" text="Generating QR code..." size="md"/>,
                    color: "green",
                };
            case "connecting":
                return {
                    title: "Connecting to WhatsApp",
                    description: "QR scanned. Connecting to WhatsApp...",
                    icon: <Wifi size={24} className="text-yellow-500"/>,
                    loader: <Loader type="dots" text="Establishing connection..." size="md"/>,
                    color: "yellow",
                };
            case "ready":
                return {
                    title: "Connected Successfully",
                    description: "Redirecting to dashboard...",
                    icon: <CheckCircle size={24} className="text-green-500"/>,
                    loader: <Loader type="pulse" text="Preparing dashboard..." size="md"/>,
                    color: "green",
                };
            case "error":
                return {
                    title: "Connection Error",
                    description: "Failed to connect. Please try again.",
                    icon: <AlertCircle size={24} className="text-red-500"/>,
                    loader: null,
                    color: "red",
                };
            default:
                return {
                    title: "Status Unknown",
                    description: "Determining connection status...",
                    icon: <WifiOff size={24} className="text-gray-500"/>,
                    loader: <Loader type="spinner" text="Checking status..." size="md"/>,
                    color: "gray",
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-green-500 text-white p-6">
                    <h1 className="text-3xl font-bold">WhatsApp Connection</h1>
                    <p className="mt-2 opacity-90">Connect your WhatsApp account to continue</p>
                    <p className="text-red-500">**Please keep in Mind this is beta mood and only for experimental
                        purposes ,
                        Please use it with
                        responsibility**</p>
                </div>

                <div className="p-6">
                    <div
                        className={`mb-8 p-6 rounded-xl border-2 border-${statusInfo.color}-200 bg-${statusInfo.color}-50`}>
                        <div className="flex items-center gap-4 mb-4">
                            {statusInfo.icon}
                            <h2 className="text-xl font-bold">{statusInfo.title}</h2>
                        </div>
                        <p className="text-gray-600 mb-4">{statusInfo.description}</p>
                        {statusInfo.loader && <div className="my-6 flex justify-center">{statusInfo.loader}</div>}
                        {initStatus === "error" && (
                            <button
                                onClick={handleRetry}
                                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCw size={20}/>
                                Retry Connection
                            </button>
                        )}
                    </div>

                    {initStatus === "scanning" && qr && !qrScanned && (
                        <div className="flex flex-col items-center mb-8">
                            <div className="p-4 bg-white rounded-xl shadow-md mb-4">
                                <QRCode value={qr} size={256} className="transition-all hover:scale-105"/>
                            </div>
                            <p className="text-sm text-gray-500 max-w-md text-center">
                                Scan this QR code with your phone to link your WhatsApp account. The QR code will expire
                                after a few minutes.
                            </p>
                        </div>
                    )}

                    {initStatus === "ready" && <LinkedAccount/>}

                    {/* Progress Bar */}
                    <div className="flex justify-between items-center mt-8 mb-4">
                        {["searching", "scanning", "connecting", "ready"].map((stage, i) => (
                            <React.Fragment key={i}>
                                <div
                                    className={`h-2 flex-1 rounded-full ${
                                        ["searching", "scanning", "connecting", "ready"].indexOf(initStatus) >= i
                                            ? "bg-green-500"
                                            : "bg-gray-200"
                                    }`}
                                ></div>
                                {i < 3 && <div className="mx-2"/>}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Checking</span>
                        <span>QR Code</span>
                        <span>Connecting</span>
                        <span>Ready</span>
                    </div>

                    <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-2">Tips for connecting:</h3>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                            <li>Ensure your phone has an active internet connection</li>
                            <li>Keep your phone unlocked while scanning the QR</li>
                            <li>Refresh the page if QR code expires</li>
                            <li>Once connected, you can use WhatsApp from this browser</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 border-t text-center text-xs text-gray-500">
                    WhatsApp connection status is updated in real-time • Refresh count: {retryCount}
                </div>
            </div>
        </div>
    );
};

export default Profile;
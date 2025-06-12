import React, {useEffect, useState} from "react";
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

const socketRef = io(import.meta.env.VITE_BASE_URL);

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {qr, qrStatus} = useSelector((state) => state.app);
    const user = useSelector((state) => state.user);
    const [initStatus, setInitStatus] = useState("searching");
    const [loading, setLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [qrScanned, setQrScanned] = useState(false);

    useEffect(() => {
        if (user.isConnected) {
            navigate("/dashboard");
        }
    }, [user.isConnected, navigate]);
    // useEffect(() => {
    //     initSession()
    // }, [])

    // Initialize socket once
    useEffect(() => {
        const connectAndInit = () => {
            if (user._id) {
                console.log("Emitting join for user:", user._id);
                socketRef.emit("join", user._id);

                setTimeout(() => {
                    initSession(); // ✅ this will now always run
                }, 300);
            }
        };

        if (!socketRef.connected) {
            // Attach listener only once before connect
            socketRef.once("connect", () => {
                console.log("Socket connected (via event)");
                connectAndInit();
            });

            socketRef.connect();
        } else {
            // ✅ Socket already connected (e.g. hot reload / re-render), run directly
            console.log("Socket already connected");
            connectAndInit();
        }

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

        return () => {
            socketRef.off("qr");
            socketRef.off("authenticated");
            socketRef.off("ready");
            socketRef.off("auth_failure");
            socketRef.off("disconnected");
        };
    }, [dispatch, navigate, user._id]);

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-green-500 text-white p-6">
                    <h1 className="text-3xl font-bold">WhatsApp Connection</h1>
                    <p className="mt-2 opacity-90">Connect your WhatsApp account to continue</p>
                    <p className="text-red-500 font-medium">**Please keep in Mind this is beta mood and only for
                        experimental
                        purposes ,
                        Please use it with
                        responsibility**</p>
                </div>

                <details className="px-4 pt-2 text-sm">
                    <summary className="text-red-500 font-semibold cursor-pointer">
                        Beta Access Info & Known Issues
                    </summary>
                    <div className="mt-2 space-y-2 text-gray-800">
                        <p><strong>🧪 Welcome to the Beta!</strong> You're using an early access version of our WhatsApp
                            Automation Platform. This version is still under active development, and you might encounter
                            a few hiccups.</p>

                        <p><strong>⚠️ Known Issues & Possible Scenarios:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>QR Code Not Generating:</strong> This may be due to temporary server load,
                                session locking, or network delays. Please wait 1–2 minutes, and refresh or try again.
                            </li>
                            <li><strong>Session Getting Stuck:</strong> If the app says "initializing session" for a
                                long time, it's possible a previous session was interrupted. Try restarting the app, or
                                clearing the browser cache and reloading.
                            </li>
                            <li><strong>Socket Disconnections:</strong> If you're getting disconnected frequently,
                                ensure your internet is stable. We're actively working on improving socket reliability.
                            </li>
                            <li><strong>Chrome Debug File Locked Error:</strong> In some rare cases, background Chrome
                                processes hold on to session files. This can block re-authentication. Close all Chrome
                                or Electron-based apps and retry.
                            </li>
                        </ul>

                        <p><strong>🛠 What You Can Try:</strong></p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Reload the page and wait a few seconds before retrying.</li>
                            <li>Ensure no other tab or session is already using WhatsApp Web.</li>
                            <li>Try using a different browser or private/incognito window.</li>
                            <li>If using Electron or a desktop version, close and reopen the app.</li>
                            <li>Try after a few minutes — the issue may be due to temporary load.</li>
                        </ul>

                        <p><strong>📨 Still stuck?</strong> Please help us improve by reporting your issue here — <a
                            href="https://tally.so/r/mZLe0V" target="_blank" rel="noopener noreferrer"
                            className="underline text-blue-600">Click to Report a Bug</a></p>

                        <p><strong>🚧 We're actively working on it:</strong> All these bugs are being tracked and fixed.
                            The beta phase helps us identify edge cases and server scaling issues.</p>

                        <p><strong>✅ Final Release Promise:</strong> The stable release will be polished, bug-free, and
                            optimized for performance. Thank you for your support and patience during this phase — it
                            means a lot! 💙</p>

                        <p><em>— Team WaBot 🚀</em></p>
                    </div>
                </details>

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
                    <p className="py-1 text-red-500">This is one time process or may take upto 10 min please be
                        patient. </p>
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
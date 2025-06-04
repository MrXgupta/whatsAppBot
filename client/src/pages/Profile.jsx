import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import Swal from "sweetalert2";
import QR from "../Components/Profile/Qr.jsx";
import LinkedAccount from "../Components/Profile/LinkedAccount.jsx";
import { setQr, setClientReady, setQrStatus } from "../slices/appSlice.js";

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

const Profile = () => {
    const dispatch = useDispatch();
    const { qr, qrStatus } = useSelector((state) => state.app);
    const user = useSelector((state) => state.user);
    const [loadingQr, setLoadingQr] = useState(true);

    useEffect(() => {
        if (user?._id) {
            socket.emit("join", user._id);
        } else {
            Swal.fire({
                icon: "warning",
                title: "User Not Found",
                text: "Please login first.",
            });
        }
    }, [user._id]);

    useEffect(() => {
        socket.on("qr", (qrCode) => {
            console.log("✅ QR RECEIVED");
            dispatch(setQr(qrCode));
            dispatch(setQrStatus("loading"));
            dispatch(setClientReady(false));
            setLoadingQr(false);

            Swal.fire({
                icon: "info",
                title: "QR Code Ready",
                text: "Please scan the QR code.",
                toast: true,
                position: "top-end",
                timer: 2500,
                showConfirmButton: false,
            });
        });

        socket.on("authenticated", () => {
            dispatch(setQrStatus("scanned"));
            Swal.fire("QR Scanned", "Connecting to WhatsApp...", "info");
        });

        socket.on("ready", () => {
            dispatch(setClientReady(true));
            dispatch(setQrStatus("ready"));
            dispatch(setQr(""));
            Swal.fire("Connected", "WhatsApp client is ready!", "success");
        });

        socket.on("auth_failure", (msg) => {
            dispatch(setQrStatus("error"));
            dispatch(setClientReady(false));
            Swal.fire("Auth Failure", msg || "WhatsApp auth failed.", "error");
        });

        socket.on("disconnected", (reason) => {
            dispatch(setQrStatus("error"));
            dispatch(setClientReady(false));
            Swal.fire("Disconnected", reason || "Client was disconnected.", "warning");
        });

        return () => {
            socket.off("qr");
            socket.off("authenticated");
            socket.off("ready");
            socket.off("auth_failure");
            socket.off("disconnected");
        };
    }, [dispatch]);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">🔐 WhatsApp Client Status</h1>

            {qrStatus === "idle" && <p className="text-gray-500">⏳ Waiting for client...</p>}
            {qrStatus === "loading" && !qr && <p className="text-gray-500">⚙️ Preparing QR...</p>}

            <div className="bg-white shadow rounded p-6 border border-gray-200">
                <QR />
            </div>

            <LinkedAccount />
        </div>
    );
};

export default Profile;
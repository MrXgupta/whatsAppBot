import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import Swal from "sweetalert2";
import QR from "../Components/Qr.jsx";
import LinkedAccount from "../Components/LinkedAccount.jsx";
import { setQr, setClientReady, setQrStatus } from "../slices/appSlice.js";

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

const Profile = () => {
    const dispatch = useDispatch();
    const { qr, clientReady } = useSelector((state) => state.app);
    const [loadingQr, setLoadingQr] = useState(true);
    const [qrError, setQrError] = useState("");

    useEffect(() => {
        socket.on("qr", (qrCode) => {
            dispatch(setQr(qrCode));
            dispatch(setQrStatus("loading"));
            dispatch(setClientReady(false));
            setLoadingQr(false);
            Swal.fire({
                icon: "info",
                title: "QR Code Ready",
                text: "Please scan the QR code.",
                timer: 2500,
                toast: true,
                position: "top-end",
                showConfirmButton: false,
            });
        });

        socket.on("authenticated", () => {
            dispatch(setQrStatus("scanned"));
            Swal.fire({
                icon: "info",
                title: "QR Scanned",
                text: "Connecting to WhatsApp...",
                toast: true,
                timer: 2500,
                position: "top-end",
                showConfirmButton: false
            });
        });

        socket.on("ready", () => {
            dispatch(setClientReady(true));
            dispatch(setQrStatus("ready"));
            dispatch(setQr(""));
            Swal.fire({
                icon: "success",
                title: "Connected",
                text: "WhatsApp client is ready!",
                toast: true,
                timer: 3000,
                position: "top-end",
                showConfirmButton: false,
            });
        });

        socket.on("auth_failure", (msg) => {
            dispatch(setQrStatus("error"));
            dispatch(setClientReady(false));
            Swal.fire({
                icon: "error",
                title: "Auth Failure",
                text: msg || "WhatsApp authentication failed.",
            });
        });

        socket.on("disconnected", (reason) => {
            dispatch(setQrStatus("error"));
            dispatch(setClientReady(false));
            Swal.fire({
                icon: "warning",
                title: "Disconnected",
                text: reason || "WhatsApp client was disconnected.",
            });
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

            <div className="bg-white shadow rounded p-6 border border-gray-200">
                <QR />
            </div>
            <LinkedAccount />
        </div>
    );
};

export default Profile;

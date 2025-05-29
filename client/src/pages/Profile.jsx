import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import Swal from "sweetalert2";
import QR from "../Components/Qr.jsx";
import {
    setQr,
    setClientReady,
} from "../slices/appSlice.js";
import { handleReconnect } from "../Components/Functions.js";
import LinkedAccount from "../Components/LinkedAccount.jsx";
const socket = io("http://localhost:3000");
const Profile = () => {
    const dispatch = useDispatch();
    const { qr, clientReady } = useSelector((state) => state.app);
    const [loadingQr, setLoadingQr] = useState(false);
    useEffect(() => {
        socket.on("qr", (qrCode) => {
            dispatch(setQr(qrCode));
            dispatch(setClientReady(false));
            setLoadingQr(false);
        });

        socket.on("ready", () => {
            dispatch(setClientReady(true));
            dispatch(setQr(""));
            Swal.fire({
                icon: "success",
                title: "Connected",
                text: "WhatsApp client is ready!",
            });
        });

        socket.on("auth_failure", (msg) => {
            dispatch(setClientReady(false));
            Swal.fire({
                icon: "error",
                title: "Auth Failure",
                text: msg || "WhatsApp authentication failed.",
            });
        });

        socket.on("disconnected", (reason) => {
            dispatch(setClientReady(false));
            Swal.fire({
                icon: "warning",
                title: "Disconnected",
                text: reason || "WhatsApp client was disconnected.",
            });
        });

        return () => {
            socket.off("qr");
            socket.off("ready");
            socket.off("auth_failure");
            socket.off("disconnected");
        };
    }, [dispatch]);
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">🔐 WhatsApp Client Status</h1>

            <div className="bg-white shadow rounded p-6 border border-gray-200">
                <QR
                    loadingQr={loadingQr}
                    qr={qr}
                    clientReady={clientReady}
                    handleReconnect={() => handleReconnect(setLoadingQr)}
                />
            </div>
            <LinkedAccount />
        </div>
    );
};
export default Profile;

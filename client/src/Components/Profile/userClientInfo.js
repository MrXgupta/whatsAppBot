import { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import {setClientReady} from "../../slices/appSlice.js";
import {useSelector} from "react-redux";

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export default function useClientInfo() {
    const [clientInfo, setClientInfo] = useState(null);
    const isLoggedOut = useRef(false);
    const {clientReady} = useSelector((state) => state.app);

    useEffect(() => {
        socket.on("client_info", (info) => {
            if (!isLoggedOut.current) {
                setClientInfo(info);
            }
        });

        const fetchClientInfo = async () => {
            if (isLoggedOut.current) return;
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_BASE_URL}/client-info`);
                setClientInfo(data);
            } catch {
                console.warn("No client info available.");
            }
        };

        fetchClientInfo();

        return () => {
            socket.off("client_info");
        };
    }, [clientReady]);

    return { clientInfo, setClientInfo };
}

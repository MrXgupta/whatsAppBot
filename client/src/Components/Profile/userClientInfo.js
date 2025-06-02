import { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export default function useClientInfo() {
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
    }, []);

    return { clientInfo, setClientInfo };
}

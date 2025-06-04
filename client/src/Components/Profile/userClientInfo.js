import { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useSelector } from "react-redux";

const socket = io(`${import.meta.env.VITE_BASE_URL}`);

export default function useClientInfo() {
    const [clientInfo, setClientInfo] = useState(null);
    const isLoggedOut = useRef(false);
    const { clientReady } = useSelector((state) => state.app);
    const user = useSelector(state => state.user);

    useEffect(() => {
        socket.emit("join", user._id);

        socket.on("client_info", (info) => {
            if (!isLoggedOut.current) {
                setClientInfo(info);
            }
        });

        const fetchClientInfo = async () => {
            if (isLoggedOut.current || !user._id) return;

            try {
                const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/client-info`, {
                    userId: user._id
                });
                setClientInfo(data);
            } catch {
                console.warn("No client info available.");
            }
        };

        fetchClientInfo();

        return () => {
            socket.off("client_info");
        };
    }, [clientReady, user._id]);

    return { clientInfo, setClientInfo };
}

import NavBar from "../Components/NavBar.jsx";
import {Outlet, useLocation} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useRef, useState} from "react";
import {setConnectionStatus} from "../slices/userSlice.js";
import axios from "axios";

const Layout = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const userId = user._id;

    const hideNavbarRoutes = ["/profile"];
    const hideNavbar = hideNavbarRoutes.includes(location.pathname);

    const [showBetaInfo, setShowBetaInfo] = useState(false);
    const [dragPosition, setDragPosition] = useState({x: 20, y: 20});
    const dragRef = useRef(null);
    const isDragging = useRef(false);
    const offset = useRef({x: 0, y: 0});

    useEffect(() => {
        if (!userId) return;

        const checkConnection = async () => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/session/status`, {userId});
                const status = res.data.status;
                dispatch(setConnectionStatus(status === "ready"));
            } catch (err) {
                console.warn("Status check failed:", err);
                dispatch(setConnectionStatus(false));
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 60000);
        return () => clearInterval(interval);
    }, [userId]);

    // Drag event handlers
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            setDragPosition({
                x: e.clientX - offset.current.x,
                y: e.clientY - offset.current.y
            });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handleMouseDown = (e) => {
        isDragging.current = true;
        const rect = dragRef.current.getBoundingClientRect();
        offset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    return (
        <>
            <div className="flex">
                <nav className="bg-white min-h-screen max-h-[200vh]">
                    {!hideNavbar && <NavBar/>}
                </nav>
                <div
                    className={`flex-1 flex flex-col overflow-hidden border ${!hideNavbar ? "" : "ml-0"} min-h-screen`}>
                    {/* Top-right Beta Button */}
                    <div className="fixed top-4 right-4 z-50">
                        <button
                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded shadow-md"
                            onClick={() => setShowBetaInfo(!showBetaInfo)}
                        >
                            {showBetaInfo ? "Hide Beta Info" : "Beta Info"}
                        </button>
                    </div>

                    {/* Sliding Info Box */}
                    {showBetaInfo && (
                        <div
                            ref={dragRef}
                            onMouseDown={handleMouseDown}
                            style={{
                                top: `${dragPosition.y}px`,
                                left: `${dragPosition.x}px`,
                                position: 'fixed',
                                zIndex: 9999,
                                cursor: 'move',
                                transition: 'all 0.3s ease-in-out',
                            }}
                            className="bg-yellow-100 text-yellow-900 shadow-lg border border-yellow-400 rounded-lg p-4 w-[300px] animate-slide-down"
                        >
                            <h2 className="text-lg font-semibold mb-2">🚧 Beta Release Notice</h2>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                <li><strong>This is a beta release</strong>. The application is under active
                                    development.
                                </li>
                                <li>Some features may not work as expected or may be incomplete.</li>
                                <li>Performance issues or crashes can occur due to server limitations.</li>
                                <li>If the app crashes, please help us by reporting it with any relevant details.</li>
                                <li>Do not rely on this tool for critical or large-scale tasks during the beta phase.
                                </li>
                                <li>Your feedback is valuable and helps improve stability and feature set.</li>
                                <li>
                                    <strong>Report issues via:</strong><br/>
                                    <a href="https://tally.so/r/mZLe0V" target="_blank"
                                       className="text-blue-600 underline">Click here</a><br/>
                                </li>
                            </ul>

                        </div>
                    )}

                    <Outlet/>
                </div>
            </div>
        </>
    );
};

export default Layout;

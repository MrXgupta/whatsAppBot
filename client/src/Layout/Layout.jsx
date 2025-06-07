import NavBar from "../Components/NavBar.jsx";
import {Outlet, useLocation} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {setConnectionStatus} from "../slices/userSlice.js";
import axios from "axios";

const Layout = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user);
    const userId = user._id;

    useEffect(() => {
        if (!userId) return;

        const checkConnection = async () => {
            try {
                const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/session/status`, {
                    userId,
                });

                const status = res.data.status;

                if (status === 'ready') {
                    console.log('connected');
                    dispatch(setConnectionStatus(true));
                } else {
                    dispatch(setConnectionStatus(false));
                }
            } catch (err) {
                console.warn("Status check failed:", err);
                dispatch(setConnectionStatus(false));
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 60000);

        return () => clearInterval(interval);
    }, [userId]);


    // Routes where NavBar should be hidden
    const hideNavbarRoutes = ["/profile"];

    const hideNavbar = hideNavbarRoutes.includes(location.pathname);

    return (
        <>
            <div className="flex">
                <nav className="bg-white min-h-screen max-h-[200vh]">
                    {!hideNavbar && <NavBar/>}
                </nav>
                <div
                    className={`flex-1 flex flex-col overflow-hidden border ${!hideNavbar ? "" : "ml-0"} min-h-screen`}>
                    <Outlet/>
                </div>
            </div>
        </>
    );
};

export default Layout;

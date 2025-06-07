import {Link, useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {Bot, Layers, LayoutDashboard, LogIn, LogOut, MessageCircleMore, MessageSquareQuote, Users,} from "lucide-react";
import logo from "../../public/logo.svg";
import useClientInfo from "./Profile/userClientInfo.js";
import {logoutUser} from "../slices/userSlice";

const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {clientInfo} = useClientInfo();
    const user = useSelector(state => state.user);

    const navItems = [
        {to: "/dashboard", label: "Dashboard", icon: LayoutDashboard},
        {to: "/campaigns", label: "Campaigns", icon: Layers},
        {to: "/contacts", label: "Contacts", icon: Users},
        {to: "/inbox", label: "Inbox", icon: MessageCircleMore},
        {to: "/chatbot", label: "Chat Bot", icon: Bot},
        {to: "/chatbot/logs", label: "ChatBot Replies", icon: MessageSquareQuote},
    ];

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/login");
    };

    return (
        <aside
            className="group w-20 hover:w-64 transition-all duration-300 bg-white shadow-md p-4 flex flex-col gap-6 overflow-hidden min-h-screen h-full">
            <div className="flex items-center justify-between">
                <img
                    src={clientInfo?.profilePicUrl || logo}
                    alt="logo"
                    className="w-full h-full rounded-[50%]"
                />
            </div>

            <nav className="flex-1 flex flex-col gap-4">
                {navItems.map(({to, label, icon: Icon}) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex items-center px-3 py-2 rounded-md text-gray-600 font-medium hover:bg-indigo-100 hover:text-indigo-700 transition-all ${
                            location.pathname === to ? "bg-indigo-50 text-indigo-700 font-semibold" : ""
                        }`}
                    >
                        <Icon className="w-5 h-5 shrink-0"/>
                        <span
                            className="ml-3 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm text-black">
              {label}
            </span>
                    </Link>
                ))}

                {user && user._id ? (
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-all"
                    >
                        <LogOut className="w-5 h-5"/>
                        <span className="ml-3 opacity-0 group-hover:opacity-100 whitespace-nowrap text-sm">
              Logout
            </span>
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center px-3 py-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-all"
                    >
                        <LogIn className="w-5 h-5"/>
                        <span className="ml-3 opacity-0 group-hover:opacity-100 whitespace-nowrap text-sm">
              Login
            </span>
                    </Link>
                )}

                <div className="flex items-center px-3 py-2 text-gray-400 text-sm">
                    {/*<MoreHorizontal className="w-5 h-5"/>*/}
                    <div
                        className={`ml-3 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300 }`}>
                        {user.name} <br/> {user.email}
                    </div>
                </div>

            </nav>
        </aside>
    );
};

export default NavBar;

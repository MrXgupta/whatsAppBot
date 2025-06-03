import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Layers, Users, UserCircle, MoreHorizontal , Bot , MessageSquareQuote , ScrollText } from "lucide-react";
import logo from "../../public/logo.svg"
import useClientInfo from "./Profile/userClientInfo.js"

const NavBar = () => {
    const location = useLocation();
    const { clientInfo } = useClientInfo();

    const navItems = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/campaigns", label: "Campaigns", icon: Layers },
        { to: "/contacts", label: "Contacts", icon: Users },
        { to: "/profile", label: "Profile", icon: UserCircle },
        { to: "/chatbot", label: "Chat Bot", icon: Bot },
        { to: "/chatbot/logs", label: "ChatBot Replies", icon: MessageSquareQuote },
        // { to: "/inbox", label: "Inbox", icon: ScrollText },
    ];

    return (
        <aside className="group w-20 hover:w-64 transition-all duration-300 bg-white shadow-md p-4 flex flex-col gap-6 overflow-hidden">
            <div className="flex items-center justify-between">
                {/*<h1 className="text-center font-bold text-gray-700 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">WhatsApp Bulk Sender</h1>*/}
                <img src={clientInfo?.profilePicUrl || logo} alt="" className="w-full h-full rounded-[50%]" />
            </div>

            <nav className="flex-1 flex flex-col gap-4">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex items-center px-3 py-2 rounded-md text-gray-600 font-medium hover:bg-indigo-100 hover:text-indigo-700 transition-all ${location.pathname === to ? 'bg-indigo-50 text-indigo-700 font-semibold' : ''}`}
                    >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="ml-3 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm text-black">
                            {label}
                        </span>
                    </Link>
                ))}
                <div className="flex items-center px-3 py-2 text-gray-400 text-sm">
                    <MoreHorizontal className="w-5 h-5" />
                    <span className="ml-3 whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300">
                        More coming...
                    </span>
                </div>
            </nav>
        </aside>
    );
};

export default NavBar;

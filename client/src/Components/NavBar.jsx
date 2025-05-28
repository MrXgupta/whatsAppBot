import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Layers, Users, UserCircle, MoreHorizontal } from "lucide-react";

const NavBar = () => {
    const location = useLocation();

    const navItems = [
        { to: "/", label: "Dashboard", icon: LayoutDashboard },
        { to: "/campaigns", label: "Campaigns", icon: Layers },
        { to: "/contacts", label: "Contacts", icon: Users },
        { to: "/profile", label: "Profile", icon: UserCircle },
        { to: "/", label: "More Coming...", icon: MoreHorizontal },
    ];

    return (
        <aside className="group h-screen w-20 hover:w-64 transition-all bg-white shadow-md border-r p-4 flex flex-col gap-6">
            <div className="flex justify-center items-center">
                <img src="https://globecommunication.in/images/inner-pages/whatsapp-business.png" alt="" className="w-[50px]"/>
            </div>

            <nav className="flex-1 flex flex-col gap-4 transition-all">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 font-medium hover:bg-indigo-100 hover:text-indigo-700 transition-all ${location.pathname === to ? 'bg-indigo-50 text-indigo-700 font-semibold' : ''}`}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="hidden group-hover:block text-black text-sm ">{label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default NavBar;

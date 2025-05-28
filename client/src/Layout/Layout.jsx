import NavBar from "../Components/NavBar.jsx"
import {Outlet} from "react-router-dom";

const Layout = () => {
    return (
        <>
            <div className="flex">
            <NavBar />
                <div className="border p-6 w-full">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default Layout;

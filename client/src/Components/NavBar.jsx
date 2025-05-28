import { Link } from "react-router-dom";
const NavBar = () => {
    return (
        <>
            <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-xl text-gray-600 text-center p-2 font-bold">WhatsApp Bulk Sender</h1>
            </div>
                <div className="flex flex-col">
                    <Link to="/" className="text-lg text-gray-600 px-4 p-2 font-bold hover:text-black">Dashboard</Link>
                    <Link to="/contacts" className="text-lg text-gray-600 px-4 p-2 font-bold hover:text-black">Contacts</Link>
                    <h2 className="text-lg text-gray-600 px-4 p-2 font-bold hover:text-black">More to come..</h2>
                </div>
            </div>
        </>
    )
}

export default NavBar;
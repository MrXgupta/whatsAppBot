import { useEffect, useState } from "react";

const Loader = () => {
    const [show, setShow] = useState(false);

    // Ensure loader shows for at least 1s
    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 200);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-blue-400 opacity-50 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
                <div className="absolute inset-2 bg-blue-500 rounded-full"></div>
            </div>
        </div>
    );
};

export default Loader;

// src/components/Loader.jsx
import React from "react";

const Loader = ({ type = "default", text = "Loading...", size = "md" }) => {
    // Size classes
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    // Different loader types
    switch (type) {
        case "spinner":
            return (
                <div className="flex flex-col items-center justify-center">
                    <div className={`${sizeClass} border-4 border-gray-200 border-t-green-500 rounded-full animate-spin`}></div>
                    {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
                </div>
            );

        case "dots":
            return (
                <div className="flex flex-col items-center justify-center">
                    <div className="flex space-x-2">
                        <div className={`bg-green-500 rounded-full ${sizeClass} animate-bounce`} style={{ animationDelay: "0s" }}></div>
                        <div className={`bg-green-500 rounded-full ${sizeClass} animate-bounce`} style={{ animationDelay: "0.2s" }}></div>
                        <div className={`bg-green-500 rounded-full ${sizeClass} animate-bounce`} style={{ animationDelay: "0.4s" }}></div>
                    </div>
                    {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
                </div>
            );

        case "pulse":
            return (
                <div className="flex flex-col items-center justify-center">
                    <div className={`${sizeClass} bg-green-500 rounded-full animate-pulse`}></div>
                    {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
                </div>
            );

        case "whatsapp":
            return (
                <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className={`${sizeClass} bg-green-500 opacity-75 rounded-full animate-ping absolute`}></div>
                        <div className={`${sizeClass} bg-green-500 rounded-full relative`}></div>
                    </div>
                    {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
                </div>
            );

        default:
            return (
                <div className="flex flex-col items-center justify-center">
                    <div className={`${sizeClass} border-4 border-gray-200 border-t-green-500 rounded-full animate-spin`}></div>
                    {text && <p className="mt-3 text-sm text-gray-600">{text}</p>}
                </div>
            );
    }
};

export default Loader;



// import { useEffect, useState } from "react";
//
// const Loader = () => {
//     const [show, setShow] = useState(false);
//
//     useEffect(() => {
//         const timer = setTimeout(() => setShow(true), 200);
//         return () => clearTimeout(timer);
//     }, []);
//
//     if (!show) return null;
//
//     return (
//         <div className="flex items-center justify-center min-h-screen bg-white">
//             <div className="relative w-16 h-16">
//                 <div className="absolute inset-0 rounded-full border-4 border-blue-400 opacity-50 animate-ping"></div>
//                 <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
//                 <div className="absolute inset-2 bg-blue-500 rounded-full"></div>
//             </div>
//         </div>
//     );
// };
//
// export default Loader;

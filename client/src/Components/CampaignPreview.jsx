import React from "react";
import { Mic, Paperclip, Send, Smile } from "lucide-react";

const CampaignPreview = ({ message, mediaFile }) => {
    return (
        <div className="w-full md:w-1/2 flex justify-center items-start">
            <div className="w-[320px] h-[640px] bg-black rounded-[40px] border-[14px] border-black shadow-lg overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-10"></div>
                <div className="w-full h-full bg-white flex flex-col">
                    <div className="bg-emerald-600 text-white px-4 py-2 flex items-center pt-5">
                        <img
                            src="https://ui-avatars.com/api/?name=Kuber+Grains&background=ffffff&color=4caf50"
                            alt="Kuber Grains"
                            className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                            <div className="flex items-center gap-1 text-sm font-medium">
                                Kuber Grains
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.4-1.4z" />
                                </svg>
                            </div>
                            <div className="text-xs text-white/80">online</div>
                        </div>
                    </div>
                    <div className="flex-1 bg-[url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg')] bg-cover p-3 overflow-y-auto">
                        <div className="bg-white rounded-lg shadow px-3 py-2 text-sm max-w-[80%] text-gray-800">
                            {mediaFile && (
                                <img
                                    src={URL.createObjectURL(mediaFile)}
                                    alt="Preview"
                                    className="mb-2 rounded-md max-w-full"
                                />
                            )}
                            {message || 'Your message preview will appear here...'}
                        </div>
                    </div>
                    <div className="bg-white border-t px-3 py-2 flex items-center gap-2">
                        <Smile className="text-gray-500 w-4 h-4" />
                        <Paperclip className="text-gray-500 w-4 h-4" />
                        <input
                            disabled
                            type="text"
                            placeholder="Type a message"
                            className="flex-1 text-xs px-3 py-1 rounded-full border bg-gray-100"
                        />
                        <Mic className="text-gray-500 w-4 h-4" />
                        <Send className="text-emerald-500 w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignPreview;

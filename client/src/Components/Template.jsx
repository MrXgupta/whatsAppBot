import React, { useState } from "react";
import { Smile, Mic, Paperclip, Send } from "lucide-react";
import { handleSend } from "./Functions.js";

const Template = ({
                      message,
                      dispatch,
                      setMessage,
                      sending,
                      campaignName,
                      selectedContactGroup,
                      minDelay,
                      maxDelay,
                      setMinDelay,
                      setMaxDelay,
                      setSending
                  }) => {
    const [mediaFile, setMediaFile] = useState(null);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Form */}
            <div className="w-full md:w-1/2 p-6 bg-white shadow rounded-lg border">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                        <textarea
                            className="w-full border p-3 rounded resize-none"
                            rows="6"
                            value={message}
                            onChange={(e) => dispatch(setMessage(e.target.value))}
                            placeholder="Type your message here..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Attach Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setMediaFile(e.target.files[0])}
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Min Delay (sec)</label>
                            <input
                                type="number"
                                value={minDelay}
                                onChange={(e) => setMinDelay(Math.max(20, Math.min(60, Number(e.target.value))))}
                                className="w-full px-3 py-2 border rounded"
                                min={20}
                                max={60}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Max Delay (sec)</label>
                            <input
                                type="number"
                                value={maxDelay}
                                onChange={(e) => setMaxDelay(Math.max(20, Number(e.target.value)))}
                                className="w-full px-3 py-2 border rounded"
                                min={20}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            handleSend({
                                campaignName,
                                selectedContactGroup,
                                message,
                                minDelay,
                                maxDelay,
                                mediaFile,
                                setSending
                            })
                        }
                        disabled={sending}
                        className={`w-full px-6 py-3 rounded font-semibold text-white transition ${
                            sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {sending ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </div>

            {/* Right: Phone Preview */}
            <div className="w-full md:w-1/2 flex justify-center items-start">
                <div className="w-[320px] h-[640px] bg-black rounded-[40px] border-[14px] border-black shadow-lg overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-xl z-10"></div>

                    {/* WhatsApp UI */}
                    <div className="w-full h-full bg-white flex flex-col">
                        {/* Header */}
                        <div className="bg-emerald-600 text-white px-4 py-2 flex items-center">
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

                        {/* Chat */}
                        <div className="flex-1 bg-[url('https://i.imgur.com/DU5gFth.png')] bg-cover p-3 overflow-y-auto">
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

                        {/* Footer */}
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
        </div>
    );
};

export default Template;

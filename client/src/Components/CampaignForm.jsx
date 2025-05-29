import React from "react";
import { useDispatch } from "react-redux";
import { setMessage } from "../slices/appSlice";
import { handleSend } from "./Functions";

const CampaignForm = ({
                          campaignName,
                          setCampaignName,
                          selectedContactGroup,
                          setSelectedContactGroup,
                          groups,
                          message,
                          mediaFile,
                          setMediaFile,
                          minDelay,
                          setMinDelay,
                          maxDelay,
                          setMaxDelay,
                          sending,
                          setSending,
                          setMessageValue,
                      }) => {

    return (
        <div className="w-full md:w-1/2 p-6 bg-white shadow rounded-lg border">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Campaign Name</label>
                    <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="E.g. Diwali Promotion"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Select Contact Group</label>
                    <select
                        value={selectedContactGroup}
                        onChange={(e) => setSelectedContactGroup(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    >
                        <option value="">-- Select Campaign Contacts --</option>
                        {groups.map((g) => (
                            <option key={g._id} value={g._id}>
                                {g.groupName} ({g.numbers.length} contacts)
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                    <textarea
                        className="w-full border p-3 rounded resize-none"
                        rows="6"
                        value={message}
                        onChange={(e) => setMessageValue(e.target.value)}
                        placeholder="Type your message here..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Attach Image</label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 01-2.828 0L3 11.828m0 0a4 4 0 015.656-5.656l1.414 1.414L17 3" />
                        </svg>
                        Choose Image
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setMediaFile(e.target.files[0])}
                            className="hidden"
                        />
                    </label>

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
    );
};

export default CampaignForm;

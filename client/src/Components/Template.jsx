import { handleSend } from "../Components/Functions.js"
import React from "react";

const Template = ({message, dispatch, setMessage , sending , campaignName,
                      selectedContactGroup,
                      minDelay,
                      maxDelay,
                      setSending,
                  }) => {
    return (
        <>
        <textarea
            className="border w-full p-2 mb-4 rounded"
            rows="4"
            value={message}
            onChange={e => dispatch(setMessage(e.target.value))}
            placeholder="Type your message here"
        ></textarea>

            <div className="border rounded p-4 bg-gray-50 mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">📄 Message Preview</h3>
                <div className="whitespace-pre-line text-gray-800">{message || 'Your message preview will appear here...'}</div>
            </div>

            <button
                onClick={() =>
                    handleSend({
                        campaignName,
                        selectedContactGroup,
                        message,
                        minDelay,
                        maxDelay,
                        setSending
                    })
                }
                disabled={sending}
                className={`px-6 py-2 rounded text-white ${sending ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600'}`}
            >
                {sending ? 'Sending...' : 'Send Message'}
            </button>
        </>
    )
}

export default Template;
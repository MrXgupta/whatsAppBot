export default function FutureScope() {
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8 lg:px-24">
            <h1 className="text-4xl font-bold text-center text-indigo-600 mb-10">
                Future Scope & Upcoming Features
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">🛒 E-commerce Integration</h2>
                    <p className="text-gray-600">
                        Seamless integration with e-commerce platforms. Connect your store directly to automate customer
                        messages.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">📦 Order Notifications</h2>
                    <p className="text-gray-600">
                        Send real-time WhatsApp messages when a customer places an order, gets it shipped,
                        or successfully receives it — enhancing trust and customer experience.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">🤖 AI-Powered Chatbot</h2>
                    <p className="text-gray-600">
                        Advanced chatbot with intent recognition, reply suggestions, and context memory
                        for smooth and intelligent customer interactions.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">📊 Deep Analytics</h2>
                    <p className="text-gray-600">
                        Campaign performance, message delivery reports, customer behavior tracking — all in
                        a visual dashboard to help you grow faster.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">🧩 CRM Integration</h2>
                    <p className="text-gray-600">
                        Sync customer data with CRMs like Zoho, Salesforce, or custom tools to power
                        personalized and automated outreach.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">🔁 Scheduled & Recurring Campaigns</h2>
                    <p className="text-gray-600">
                        Set up campaigns to run at specific times or repeat on custom intervals, perfect
                        for reminders, follow-ups, and retargeting.
                    </p>
                </div>
            </div>

            <div className="mt-16 text-center">
                <h3 className="text-lg text-gray-700 mb-4">
                    We are constantly building and listening to feedback. The final release will be
                    feature-rich, stable, and business-ready.
                </h3>
                <p className="text-gray-500 text-sm">
                    If you have ideas, suggestions, or feature requests, share them with us —
                    we’re building this for you.
                </p>
            </div>
        </div>
    );
}

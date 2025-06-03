import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './pages/Dashboard';
import ContactManager from './pages/Contacts';
import Campaigns from './pages/Campaigns';
import ShowContacts from './pages/ShowContacts';
import Profile from './pages/Profile';
import CampaignDetail from "./pages/CampaignDetail.jsx";
import ChatBot from "./pages/ChatBot.jsx"
import ChatBotConversation from "./pages/ChatBotConversation.jsx"
import ReceivedMessages from "./pages/ReceivedMessages.jsx"


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="contacts" element={<ContactManager />} />
                    <Route path="campaigns" element={<Campaigns />} />
                    <Route path="contacts/:id" element={<ShowContacts />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="/campaign/:id" element={<CampaignDetail />} />
                    <Route path="/chatbot" element={<ChatBot />} />
                    <Route path="/chatbot/logs" element={<ChatBotConversation />} />
                    <Route path="/inbox" element={<ReceivedMessages />} />
                    <Route path="*" element={<Dashboard />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;

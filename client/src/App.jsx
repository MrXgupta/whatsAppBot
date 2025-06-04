import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout';
import Dashboard from './pages/Dashboard';
import ContactManager from './pages/Contacts';
import Campaigns from './pages/Campaigns';
import ShowContacts from './pages/ShowContacts';
import Profile from './pages/Profile';
import CampaignDetail from './pages/CampaignDetail';
import ChatBot from './pages/ChatBot';
import ChatBotConversation from './pages/ChatBotConversation';
import ReceivedMessages from './pages/ReceivedMessages';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="contacts" element={<ContactManager />} />
                        <Route path="campaigns" element={<Campaigns />} />
                        <Route path="contacts/:id" element={<ShowContacts />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="campaign/:id" element={<CampaignDetail />} />
                        <Route path="chatbot" element={<ChatBot />} />
                        <Route path="chatbot/logs" element={<ChatBotConversation />} />
                        <Route path="inbox" element={<ReceivedMessages />} />
                        <Route path="*" element={<Dashboard />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;

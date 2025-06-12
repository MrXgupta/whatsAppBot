import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
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
import FutureScope from './pages/FutureScope';
import {isMobile} from 'react-device-detect';

function App() {
    if (isMobile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-4 text-center">
                <div className="max-w-md">
                    <h1 className="text-3xl font-bold mb-4">Mobile Not Supported</h1>
                    <p className="text-lg">
                        This application is currently not compatible with mobile devices. <br/>
                        Please use a desktop or laptop browser to continue.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>

                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute/>}>
                    <Route element={<Layout/>}>
                        <Route index element={<Dashboard/>}/>
                        <Route path="contacts" element={<ContactManager/>}/>
                        <Route path="campaigns" element={<Campaigns/>}/>
                        <Route path="contacts/:id" element={<ShowContacts/>}/>
                        <Route path="profile" element={<Profile/>}/>
                        <Route path="campaign/:id" element={<CampaignDetail/>}/>
                        <Route path="chatbot" element={<ChatBot/>}/>
                        <Route path="chatbot/logs" element={<ChatBotConversation/>}/>
                        <Route path="inbox" element={<ReceivedMessages/>}/>
                        <Route path="future-scope" element={<FutureScope/>}/>
                        <Route path="*" element={<Dashboard/>}/>
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;

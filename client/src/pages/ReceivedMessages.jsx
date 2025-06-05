// Enhanced ReceivedMessages.jsx
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Search, Send, Paperclip, MoreVertical, Phone, VideoIcon, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { fetchAllContacts, fetchChatHistory, sendMessage, markAsRead } from '../services/chatService';
import { format, isToday, isYesterday } from 'date-fns';
import io from 'socket.io-client';

export default function SupportChatDashboard() {
    const user = useSelector(state => state.user);
    const [selectedContact, setSelectedContact] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const chatAreaRef = useRef(null);
    
    // Connect to Socket.io for real-time updates
    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(import.meta.env.VITE_BASE_URL);
        
        // Listen for new messages
        socketRef.current.on('new-message', (data) => {
            if (data.userId === user._id) {
                // If we have the chat open that received a message
                if (selectedContact && data.from === selectedContact.id) {
                    // Add the new message to the messages list
                    setMessages(prev => [...prev, {
                        id: data.id,
                        fromSelf: false,
                        text: data.body,
                        time: format(new Date(data.timestamp), 'h:mm a')
                    }]);
                    
                    // Mark as read since we're viewing this chat
                    markAsRead(user._id, data.from);
                }
                
                // Update contacts list to show latest message
                updateContactWithNewMessage(data);
            }
        });
        
        // Clean up socket connection
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user._id, selectedContact]);
    
    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // Fetch contacts on component mount
    useEffect(() => {
        if (user._id) {
            loadContacts();
            
            // Set up polling for contacts updates (as a fallback)
            const intervalId = setInterval(() => {
                loadContacts(true); // Silent refresh
            }, 30000); // Every 30 seconds
            
            return () => clearInterval(intervalId);
        }
    }, [user._id]);
    
    // Update a contact in the list with a new message
    const updateContactWithNewMessage = (messageData) => {
        setContacts(prev => {
            const updatedContacts = [...prev];
            const contactIndex = updatedContacts.findIndex(c => c.id === messageData.from);
            
            if (contactIndex !== -1) {
                // Update existing contact
                updatedContacts[contactIndex] = {
                    ...updatedContacts[contactIndex],
                    lastMessage: {
                        body: messageData.body,
                        fromMe: false,
                        timestamp: messageData.timestamp
                    },
                    timestamp: messageData.timestamp,
                    unreadCount: selectedContact?.id === messageData.from 
                        ? 0 
                        : (updatedContacts[contactIndex].unreadCount || 0) + 1
                };
            } else {
                // Add new contact if not in list
                updatedContacts.push({
                    id: messageData.from,
                    name: messageData.fromName || messageData.from,
                    lastMessage: {
                        body: messageData.body,
                        fromMe: false,
                        timestamp: messageData.timestamp
                    },
                    timestamp: messageData.timestamp,
                    unreadCount: 1
                });
            }
            
            // Re-sort by timestamp
            return updatedContacts.sort((a, b) => b.timestamp - a.timestamp);
        });
    };
    
    // Load contacts data
    const loadContacts = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            setError(null);
            const data = await fetchAllContacts(user._id);
            if (data.success) {
                // Sort contacts by timestamp (newest first)
                const sortedContacts = data.contacts.sort((a, b) =>
                    b.timestamp - a.timestamp
                );
                setContacts(sortedContacts);
            }
        } catch (err) {
            if (!silent) setError('Failed to load contacts');
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    };
    
    // Load chat history when a contact is selected
    useEffect(() => {
        if (selectedContact && user._id) {
            loadChatHistory(selectedContact.id);
            
            // Mark messages as read when chat is opened
            if (selectedContact.unreadCount > 0) {
                markAsRead(user._id, selectedContact.id)
                    .then(() => {
                        // Update the contacts list to reflect read status
                        setContacts(prev => 
                            prev.map(contact => 
                                contact.id === selectedContact.id 
                                    ? {...contact, unreadCount: 0} 
                                    : contact
                            )
                        );
                    })
                    .catch(err => console.error("Failed to mark as read:", err));
            }
        }
    }, [selectedContact, user._id]);
    
    // Load chat history for selected contact
    const loadChatHistory = async (contactNumber) => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchChatHistory(user._id, contactNumber);
            if (data.success) {
                // Format messages for display
                const formattedMessages = data.messages.map(msg => ({
                    id: msg.id,
                    fromSelf: msg.fromMe,
                    text: msg.body,
                    timestamp: msg.timestamp,
                    time: format(new Date(msg.timestamp), 'h:mm a'),
                    status: msg.fromMe ? (msg.delivered ? 'delivered' : 'sent') : null
                }));
                setMessages(formattedMessages);
            }
        } catch (err) {
            setError('Failed to load chat history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    // Group messages by date
    const groupMessagesByDate = (messages) => {
        const groups = {};
        
        messages.forEach(message => {
            const date = new Date(message.timestamp);
            const dateStr = format(date, 'yyyy-MM-dd');
            
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            
            groups[dateStr].push(message);
        });
        
        return Object.entries(groups).map(([date, messages]) => {
            let displayDate;
            const messageDate = new Date(date);
            
            if (isToday(messageDate)) {
                displayDate = 'Today';
            } else if (isYesterday(messageDate)) {
                displayDate = 'Yesterday';
            } else {
                displayDate = format(messageDate, 'MMMM d, yyyy');
            }
            
            return { date: displayDate, messages };
        });
    };
    
    // Handle sending a new message
    const handleSend = async () => {
        if (!newMessage.trim() || !selectedContact) return;
        
        // Optimistically add message to UI
        const now = new Date();
        const tempMsg = {
            id: `temp-${now.getTime()}`,
            fromSelf: true,
            text: newMessage,
            timestamp: now.getTime(),
            time: format(now, 'h:mm a'),
            status: 'sending'
        };
        setMessages(prev => [...prev, tempMsg]);
        
        // Clear input
        const messageToSend = newMessage;
        setNewMessage('');
        
        try {
            setSendingMessage(true);
            const response = await sendMessage(user._id, selectedContact.id, messageToSend);
            if (!response.success) {
                throw new Error(response.error || 'Failed to send message');
            }
            
            // Update the temporary message with the real message ID and status
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === tempMsg.id 
                        ? {...msg, id: response.messageDetails.id, status: 'sent'} 
                        : msg
                )
            );
            
            // Update this contact in the contacts list
            setContacts(prev => {
                const updated = [...prev];
                const index = updated.findIndex(c => c.id === selectedContact.id);
                
                if (index !== -1) {
                    updated[index] = {
                        ...updated[index],
                        lastMessage: {
                            body: messageToSend,
                            timestamp: now.getTime(),
                            fromMe: true
                        },
                        timestamp: now.getTime()
                    };
                }
                
                return updated.sort((a, b) => b.timestamp - a.timestamp);
            });
            
        } catch (err) {
            // Update message status to failed
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === tempMsg.id 
                        ? {...msg, status: 'failed'} 
                        : msg
                )
            );
            
            console.error(err);
            
        } finally {
            setSendingMessage(false);
        }
    };
    
    // Filter contacts based on search and filter setting
    const filteredContacts = contacts.filter(contact => {
        // Apply search filter
        const matchesSearch = searchQuery === '' || 
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (contact.lastMessage?.body && contact.lastMessage.body.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Apply tab filter
        const matchesFilter = 
            filter === 'all' || 
            (filter === 'unread' && contact.unreadCount > 0);
            
        return matchesSearch && matchesFilter;
    });
    
    return (
        <div className="flex-1 flex bg-gray-100 h-full overflow-hidden">
            {/* Left - Contacts */}
            <div className="w-[350px] bg-white flex flex-col border-r border-gray-200 h-screen">
                {/* Header */}
                <div className="p-3 bg-[#f0f2f5] flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                        <span className="ml-2 font-medium">{user.name}</span>
                    </div>
                    <div>
                        <button className="p-2 rounded-full hover:bg-gray-200">
                            <MoreVertical size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>
                
                {/* Search bar */}
                <div className="p-2 bg-white">
                    <div className="bg-[#f0f2f5] rounded-lg flex items-center px-3 py-1.5">
                        <Search size={18} className="text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search or start new chat" 
                            className="w-full bg-transparent outline-none ml-2 text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)} 
                        />
                    </div>
                </div>
                
                {/* Filter tabs */}
                <div className="px-2 py-1 flex gap-2 text-sm font-medium border-b border-gray-200">
                    <button 
                        className={`px-3 py-1.5 rounded-lg ${filter === 'all' ? 'bg-[#e6f7ee] text-[#00a884]' : 'text-gray-500 hover:bg-gray-100'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button 
                        className={`px-3 py-1.5 rounded-lg ${filter === 'unread' ? 'bg-[#e6f7ee] text-[#00a884]' : 'text-gray-500 hover:bg-gray-100'}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread
                    </button>
                </div>
                
                {/* Contacts list */}
                {loading && !contacts.length ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-sm text-gray-500">Loading contacts...</div>
                    </div>
                ) : error && !contacts.length ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-sm text-red-500">{error}</div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {filteredContacts.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                No contacts found
                            </div>
                        ) : (
                            filteredContacts.map((contact) => (
                                <div
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`px-3 py-3 flex items-center hover:bg-gray-100 cursor-pointer border-b border-gray-100 ${
                                        selectedContact?.id === contact.id ? 'bg-[#f0f2f5]' : ''
                                    }`}
                                >
                                    {/* Contact avatar */}
                                    <div className="w-12 h-12 rounded-full bg-[#dfe5e7] flex items-center justify-center text-gray-600 font-semibold flex-shrink-0">
                                        {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    
                                    {/* Contact info */}
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-medium text-gray-900 truncate">{contact.name}</span>
                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                {contact.timestamp ? format(new Date(contact.timestamp), 'HH:mm') : ''}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-sm text-gray-500 truncate">
                                                {contact.lastMessage?.body || 'No messages'}
                                            </p>
                                            
                                            {contact.unreadCount > 0 && (
                                                <span className="ml-2 flex-shrink-0 w-5 h-5 bg-[#00a884] text-white rounded-full flex items-center justify-center text-xs">
                                                    {contact.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
            
            {/* Right - Chat */}
            <div className="flex-1 flex flex-col bg-[#efeae2] relative h-screen">
                {selectedContact ? (
                    <>
                        {/* Chat header */}
                        <div className="px-4 py-2 bg-[#f0f2f5] flex justify-between items-center border-l border-gray-200">
                            <div className="flex items-center">
                                <button 
                                    className="md:hidden p-2 rounded-full hover:bg-gray-200 mr-2"
                                    onClick={() => setSelectedContact(null)}
                                >
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                                
                                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center text-gray-600 font-semibold">
                                    {selectedContact.name.charAt(0).toUpperCase()}
                                </div>
                                
                                <div className="ml-3">
                                    <div className="font-medium">{selectedContact.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {selectedContact.isGroup ? 'Group' : 'Click here for contact info'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button className="p-2 rounded-full hover:bg-gray-200">
                                    <Search size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-200">
                                    <Phone size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-200">
                                    <VideoIcon size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-200">
                                    <MoreVertical size={20} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Chat background with pattern */}
                        <div 
                            ref={chatAreaRef}
                            className="flex-1 overflow-y-auto px-6 py-2 space-y-1 bg-[#efeae2] bg-opacity-30"
                            style={{
                                backgroundImage: "url('https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg')",
                                backgroundRepeat: 'repeat'
                            }}
                        >
                            {loading && !messages.length ? (
                                <div className="flex-1 h-full flex items-center justify-center">
                                    <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow">Loading messages...</div>
                                </div>
                            ) : error ? (
                                <div className="flex-1 h-full flex items-center justify-center">
                                    <div className="text-sm text-white bg-red-500 px-4 py-2 rounded-lg shadow">{error}</div>
                                </div>
                            ) : (
                                <>
                                    {/* Group messages by date */}
                                    {groupMessagesByDate(messages).map((group, groupIndex) => (
                                        <div key={groupIndex} className="mt-4 mb-2">
                                            {/* Date header */}
                                            <div className="flex justify-center mb-4">
                                                <div className="bg-[#e1f3fb] text-[#54656f] text-xs font-medium px-3 py-1 rounded-lg shadow-sm">
                                                    {group.date}
                                                </div>
                                            </div>
                                            
                                            {/* Messages for this date */}
                                            {group.messages.map((msg, msgIndex) => (
                                                <div 
                                                    key={msg.id} 
                                                    className={`flex ${msg.fromSelf ? 'justify-end' : 'justify-start'} mb-1`}
                                                >
                                                    <div 
                                                        className={`max-w-[65%] p-2 rounded-lg shadow-sm relative ${
                                                            msg.fromSelf 
                                                                ? 'bg-[#d9fdd3] rounded-tr-none text-gray-800' 
                                                                : 'bg-white rounded-tl-none text-gray-800'
                                                        }`}
                                                    >
                                                        <div className="text-sm whitespace-pre-line">{msg.text}</div>
                                                        
                                                        <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-gray-500">
                                                            {msg.time}
                                                            
                                                            {/* Message status indicators (for sent messages) */}
                                                            {msg.fromSelf && (
                                                                <>
                                                                    {msg.status === 'sending' && (
                                                                        <div className="w-3 h-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin"></div>
                                                                    )}
                                                                    {msg.status === 'sent' && (
                                                                        <Check size={14} className="text-gray-500" />
                                                                    )}
                                                                    {msg.status === 'delivered' && (
                                                                        <CheckCheck size={14} className="text-gray-500" />
                                                                    )}
                                                                    {msg.status === 'read' && (
                                                                        <CheckCheck size={14} className="text-blue-500" />
                                                                    )}
                                                                    {msg.status === 'failed' && (
                                                                        <span className="text-red-500 text-[10px]">!</span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Message tail */}
                                                        <div 
                                                            className={`absolute top-0 w-3 h-3 ${
                                                                msg.fromSelf 
                                                                    ? 'right-0 bg-[#d9fdd3]' 
                                                                    : 'left-0 bg-white'
                                                            }`}
                                                            style={{
                                                                clipPath: msg.fromSelf 
                                                                    ? 'polygon(0 0, 100% 0, 100% 100%)' 
                                                                    : 'polygon(0 0, 100% 0, 0 100%)'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                    
                                    {/* Invisible element for auto-scrolling */}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>
                        
                        {/* Message input */}
                        <div className="px-4 py-2 bg-[#f0f2f5] flex items-center gap-2">
                            <button className="p-2 rounded-full hover:bg-gray-200 text-[#54656f]">
                                <Paperclip size={24} />
                            </button>
                            
                            <div className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center">
                                <input
                                    type="text"
                                    className="flex-1 outline-none text-sm"
                                    placeholder="Type a message"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    disabled={sendingMessage}
                                />
                            </div>
                            
                            <button
                                onClick={handleSend}
                                className={`p-2 rounded-full ${
                                    newMessage.trim() 
                                        ? 'bg-[#00a884] hover:bg-[#008f73] text-white' 
                                        : 'bg-[#f0f2f5] text-[#8696a0]'
                                }`}
                                disabled={sendingMessage || !newMessage.trim()}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-[#f0f2f5]">
                        <div className="max-w-md text-center px-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                                <Check size={32} />
                            </div>
                            <h3 className="text-xl font-light text-gray-700 mb-1">WhatsApp Web</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Select a chat to view messages or start a new conversation.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
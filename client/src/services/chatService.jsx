// src/services/chatService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetch chat history with a specific contact
 * @param {string} userId - The user's ID
 * @param {string} contactNumber - The contact's phone number
 * @returns {Promise} - The API response
 */
export const fetchChatHistory = async (userId, contactNumber) => {
    try {
        const response = await axios.post(`${API_URL}/chats/history`, {
            userId,
            contactNumber
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch chat history' };
    }
};

/**
 * Fetch all WhatsApp contacts
 * @param {string} userId - The user's ID
 * @returns {Promise} - The API response
 */
export const fetchAllContacts = async (userId) => {
    try {
        const response = await axios.post(`${API_URL}/chats/contacts`, {
            userId
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch contacts' };
    }
};

/**
 * Send a message to a specific contact
 * @param {string} userId - The user's ID
 * @param {string} contactNumber - The contact's phone number
 * @param {string} message - The message to send
 * @returns {Promise} - The API response
 */
export const sendMessage = async (userId, contactNumber, message) => {
    try {
        const response = await axios.post(`${API_URL}/chats/send`, {
            userId,
            contactNumber,
            message
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to send message' };
    }
};

export const markAsRead = async (userId, contactNumber) => {
    try {
        const response = await axios.post(`${API_URL}/chats/mark-read`, {
            userId,
            contactNumber
        });
        return response.data;
    } catch (error) {
        console.error("Error marking as read:", error);
        throw error.response?.data || { error: 'Failed to mark messages as read' };
    }
};

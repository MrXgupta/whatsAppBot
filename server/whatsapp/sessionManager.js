const sessions = {};

const getClient = (userId) => sessions[userId.toString()];
const setClient = (userId, sessionObj) => {
    sessions[userId.toString()] = sessionObj;
};
const hasClient = (userId) => !!sessions[userId.toString()];

module.exports = { getClient, setClient, hasClient };

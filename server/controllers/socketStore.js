const userSocketMap = new Map();

module.exports = {
    addUserSocket: (userId, socket) => userSocketMap.set(userId, socket),
    getUserSocket: (userId) => userSocketMap.get(userId),
    removeUserSocket: (userId) => userSocketMap.delete(userId),
    hasUser: (userId) => userSocketMap.has(userId),
};

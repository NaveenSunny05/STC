const socketIo = require('socket.io');

let io;

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_channel', (channelId) => {
            socket.join(channelId);
            console.log(`Socket ${socket.id} joined channel ${channelId}`);
        });

        socket.on('leave_channel', (channelId) => {
            socket.leave(channelId);
            console.log(`Socket ${socket.id} left channel ${channelId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getIo };

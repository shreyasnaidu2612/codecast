import { io } from 'socket.io-client';

export const initSocket = () => {
    const options = {
        transports: ['websocket'],
        reconnectionAttempts: Infinity,
        timeout: 10000,
    };

    const socket = io(process.env.REACT_APP_BACKEND_URL, options);

    socket.on('connect', () => {
        console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    return socket;
}

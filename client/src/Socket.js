import {io} from 'socket.io-client';

export const initSocket = async () =>{
    const options = {
        'force new connection': true,
        reconnectionAttempts : 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
const socket = io("https://codecast-431705.as.r.appspot.com", {
  transports: ['websocket'],
});

export default socket;
    return io(process.env.REACT_APP_BACKEND_URL, options);
}

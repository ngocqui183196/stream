const { Server } = require('socket.io');
const io
    = new Server(4500, {
  transports: ['websocket'],
  // cors: {
    origin: "http://localhost:4200", // Cho phép yêu cầu từ client Angular
    methods: ["GET", "POST"],
  //   credentials: true
  // }
});

io.on('connection', (socket) => {
  console.log('SERVER IS RUN')
  console.log('Client connected:', socket.id);
  io.emit('user', socket.id)

  socket.on('message', (message) => {
    console.log('Received:', message);

    // Gửi phản hồi lại client
    // socket.emit('response', message);

    // PHát cho tất cả các client
    io.emit('response', message);
  });

  socket.on('disconnect', () => {
    io.emit('response', `User ${socket.id} disconect from server`)
    console.log('Client disconnected:', socket.id);
  });
});

// Todo
/* run node: node mock-websocket-server.js  */

console.log('Socket.IO server is running on ws://localhost:4200');

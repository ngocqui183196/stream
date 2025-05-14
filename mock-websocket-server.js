const { Server } = require('socket.io');
const io
    = new Server(4500, {
  transports: ['websocket'],
  // cors: {
    origin: "http://localhost:4500", // Cho phép yêu cầu từ client Angular
    methods: ["GET", "POST"],
  //   credentials: true
  // }
});

io.on('connection', (socket) => {
  console.log('SERVER IS RUN')
  console.log('Client connected:', socket.id);
  io.emit('user', socket.id)

  // Xử lý signaling messages
  socket.on('offer', (data) => {
    console.log('Received offer from:', socket.id);
    
    // Gửi offer đến client đích
    io.to(data.to).emit('offer', { ...data, from: socket.id });
  });

  socket.on('answer', (data) => {
    console.log('Received answer from:', socket.id);
    io.to(data.to).emit('answer', { ...data, from: socket.id });
  });

  socket.on('icecandidate', (data) => {
    console.log('Received ICE candidate from:', socket.id);
    io.to(data.to).emit('icecandidate', { ...data, from: socket.id });
  });

  socket.on('message', (message) => {
    console.log('Received:', message);

    // Gửi phản hồi lại client
    // socket.emit('response', message);

    // PHát cho tất cả các client
    io.emit('response', message);
  });

  // socket.on('icecandidate', (data) => {
  //   io.emit('icecandidate', data)
  // })

  socket.on('disconnect', () => {
    io.emit('response', `User ${socket.id} disconect from server`)
    console.log('Client disconnected:', socket.id);
  });
});

// Todo
/* run node: node mock-websocket-server.js  */

console.log('Socket.IO server is running on ws://localhost:4200');

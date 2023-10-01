import express from 'express';
import userRouter from './routes/userRoutes';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'path';
const app = express();
app.use(express.json());
app.use('/user', userRouter);

const server = createServer(app);
const io = new Server(server);
app.get('/', (_req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  res.sendFile('./index.html', options);
});

io.on('connection', socket => {
  console.log('a user has connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

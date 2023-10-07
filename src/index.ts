import express from 'express';
import userRouter from './routes/userRoutes';
import frienshipRoutes from './routes/friendshipRoutes';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'path';
const app = express();
app.use(function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});
app.use(express.json());
app.use('/user', userRouter);
app.use('/friendship', frienshipRoutes);

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

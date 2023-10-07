import express from 'express';
import userRouter from './routes/userRoutes';
import frienshipRoutes from './routes/friendshipRoutes';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'path';
import jwt from 'jsonwebtoken';

const app = express();
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
app.get('/1', (_req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  res.sendFile('./client_test_1.html', options);
});
app.get('/2', (_req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  res.sendFile('./client_test_2.html', options);
});
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token === null) {
    next(new Error('No credentials'));
  } else {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (err: any, user: any) => {
        if (err != null) {
          next(new Error('Bad credentials'));
          console.log('SOCKET: BAD CREDENTIALS');
        } else {
          socket.data.user_name = user.username;
          console.log('SOCKET: SUCCESSFUL AUTHENTICATION ');
          next();
        }
      },
    );
  }
  // ...
});
// io.use((socket, next)=>{

// })

io.on('connection', socket => {
  console.log(socket.data);
  console.log(`${socket.data.user_name} has connected`);
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

import express from 'express';
import userRouter from './routes/userRoutes';
import frienshipRoutes from './routes/friendshipRoutes';
import messageRoutes from './routes/messageRoutes';
import roomRoutes from './routes/roomRoutes';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'path';
import jwt from 'jsonwebtoken';
import { getUserId } from './services/userServices';
import cors from 'cors';
import { checkIfUsersAreFriends } from './services/frienshipServices';
import { PrismaClient } from '@prisma/client';
import { instrument } from '@socket.io/admin-ui';

const app = express();
const prisma = new PrismaClient();
app.use(cors({ origin: process.env.FRONTEND_URL ?? '*' }));
app.use(express.json());
app.use('/user', userRouter);
app.use('/friendship', frienshipRoutes);
app.use('/message', messageRoutes);
app.use('/room', roomRoutes);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL ?? '*'],
    credentials: true,
  },
});

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
    console.log('There is no token');
  } else {
    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (err: any, user: any) => {
        if (err != null) {
          next(new Error('Bad credentials'));
          console.log('SOCKET: BAD CREDENTIALS');
        } else {
          socket.data.username = user.username;
          console.log('SOCKET: SUCCESSFUL AUTHENTICATION ');
          next();
        }
      },
    );
  }
  // ...
});

io.on('connection', async socket => {
  console.log(
    `${socket.data.username} has connected, connection id:` + socket.id,
  );
  const userId = await getUserId(socket.data.username);
  await socket.join(userId);
  console.log('Joined to room: ', userId);
  const users = [];
  for (const [id, socket] of io.of('/').sockets) {
    users.push({
      userID: id,
      username: socket.data.username,
    });
  }
  console.log('CURRENT CONNECTED USERS: ', users);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });

  socket.on('private message', async ({ content, to }) => {
    console.log('Sending message from ', socket.data.username, ' to ', to);
    const receiverUserId = await getUserId(to);
    const areFriends = await checkIfUsersAreFriends(socket.data.username, to);
    if (!areFriends) throw new Error('Users are not friends');
    const insertedMessage = await prisma.directMessage.create({
      data: {
        senderUsername: socket.data.username,
        receiverUsername: to,
        message: content,
      },
    });

    socket.to(receiverUserId).emit('private message', insertedMessage);
    io.to(userId).emit('private message', insertedMessage);
  });
});
instrument(io, {
  auth: false,
  mode: 'development',
});
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

import express from 'express';
import userRouter from './routes/userRoutes';
import frienshipRoutes from './routes/friendshipRoutes';
import messageRoutes from './routes/messageRoutes';
import roomRoutes from './routes/roomRoutes';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'path';
import jwt from 'jsonwebtoken';
import InMemorySessionStore from './sessionStore';
import { getUserId } from './services/userServices';
import cors from 'cors';

const sessionStore = new InMemorySessionStore();
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/user', userRouter);
app.use('/friendship', frienshipRoutes);
app.use('/message', messageRoutes);
app.use('/room', roomRoutes);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
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
    next(new Error('No credentials'));
  } else {
    socket.data.sessionId = token;

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
io.use((socket, next) => {
  const sessionID = socket.data.sessionId;
  if (sessionID !== '' && sessionID !== null) {
    // find existing session
    sessionStore
      .findOrSaveSession(sessionID, socket.data.user_name)
      .then(session => {
        socket.data.userId = session.userId;
        socket.data.username = session.username;
        next();
      })
      .catch(e => {
        next(new Error(e.message));
      });
  }
});

io.on('connection', async socket => {
  console.log(socket.data);
  console.log(
    `${socket.data.user_name} has connected, userid:` +
      socket.id +
      ' Session ID: ' +
      socket.data.sessionId,
  );
  sessionStore.saveSession(socket.data.sessionId, {
    userId: socket.data.userId,
    username: socket.data.username,
    connected: true,
  });
  await socket.join(socket.data.userId);
  console.log('Joined to room: ', socket.data.userId);
  const users = [];
  for (const [id, socket] of io.of('/').sockets) {
    users.push({
      userID: id,
      username: socket.data.user_name,
    });
  }
  console.log('CURRENT CONNECTED USERS: ', users);
  socket.emit('users', users);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });

  socket.on('private message', async ({ content, to }) => {
    console.log('Sending message from ', socket.data.user_name, ' to ', to);
    const receiverUserId = await getUserId(to);
    socket.to(receiverUserId).to(socket.data.userId).emit('private message', {
      content,
      from: socket.data.user_name,
      to,
    });
  });
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});

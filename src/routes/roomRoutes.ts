import { Router } from 'express';
import authenticateToken from '../middlewares/securityMiddleware';
import {
  createRoom,
  deleteRoom,
  joinRoom,
  retrieveJoinedRooms,
  retrieveNoJoinedRooms,
  retrieveRoomUsers,
  searchNoJoinedRooms,
} from '../services/roomsServices';

const router = Router();
router.use(authenticateToken);

router.post('/', (req, res) => {
  const createdBy = req.body.verified_user.username;
  const roomName = req.body.room_name;

  createRoom(roomName, createdBy)
    .then(newRoom => {
      res.status(200).json({
        created_room: newRoom,
      });
    })
    .catch(e => {
      res.status(400).json({ message: e.message });
    });
});

router.get('/joined', (req, res) => {
  const username = req.body.verified_user.username;
  retrieveJoinedRooms(username)
    .then(rooms => {
      res.status(200).json({
        joined_rooms: rooms,
      });
    })
    .catch(e => {
      res.status(400).json({
        message: e.message,
      });
    });
});
router.get('/no-joined', (req, res) => {
  const username = req.body.verified_user.username;
  retrieveNoJoinedRooms(username)
    .then(rooms => {
      res.status(200).json({
        no_joined_rooms: rooms,
      });
    })
    .catch(e => {
      res.status(400).json({
        message: e.message,
      });
    });
});

router.post('/no-joined/search', (req, res) => {
  const username = req.body.verified_user.username;
  const roomName = req.body.room_name;
  searchNoJoinedRooms(username, roomName)
    .then(r => {
      res.status(200).json({ rooms: r });
    })
    .catch(e => {
      res.status(400).json({ message: e.message });
    });
});

router.delete('/', (req, res) => {
  const username = req.body.verified_user.username;
  const roomName = req.body.room_name;
  deleteRoom(roomName, username)
    .then(r =>
      res.status(200).json({
        deleted_room: r,
      }),
    )
    .catch(e => res.status(400).json({ message: e.message }));
});

router.post('/join', (req, res) => {
  const username = req.body.verified_user.username;
  const roomName = req.body.room_name;
  joinRoom(roomName, username)
    .then(r => {
      res.status(200).json({
        joined_room: r,
      });
    })
    .catch(e => {
      res.status(400).json({
        message: e.message,
      });
    });
});

router.get('/users', (req, res) => {
  const roomName = req.query.room_name as string;
  const username = req.body.verified_user.username;
  retrieveRoomUsers(roomName, username)
    .then(usernames => {
      res.status(200).json({
        usernames,
      });
    })
    .catch(e => {
      res.status(400).json({
        message: e.message,
      });
    });
});
export default router;

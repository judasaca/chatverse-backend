import { Router } from 'express';
import authenticateToken from '../middlewares/securityMiddleware';
import { createRoom } from '../services/roomsServices';

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

export default router;

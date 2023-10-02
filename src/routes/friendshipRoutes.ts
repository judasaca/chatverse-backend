import { Router } from 'express';
import authenticateToken from '../middlewares/securityMiddleware';
import { sendFriendshipInvitation } from '../services/friendshipInvitationServices';

const router = Router();
router.use(authenticateToken);

router.post('/invitations/send', (req, res) => {
  const senderUsername = req.body.verified_user.username;
  const receiverUsername = req.body.receiver_username;
  if (receiverUsername === null)
    res.status(400).json({
      message: 'You need to provide receiver_username field',
    });
  else {
    sendFriendshipInvitation(senderUsername, receiverUsername)
      .then(_r => res.sendStatus(200))
      .catch(e => {
        res.status(400).json({
          message: e.message,
        });
      });
  }
});

export default router;

import { Router } from 'express';
import authenticateToken from '../middlewares/securityMiddleware';
import {
  acceptFriendshipInvitation,
  cancelFriendshipInvitation,
  rejectFriendshipInvitation,
  sendFriendshipInvitation,
} from '../services/friendshipInvitationServices';

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

router.post('/invitations/accept/:invitationId', (req, res) => {
  const invitationId = req.params.invitationId;
  const receiverUsername = req.body.verified_user.username;
  acceptFriendshipInvitation(receiverUsername, invitationId)
    .then(frienship => res.status(200).json(frienship))
    .catch(e => res.status(400).json({ message: e.message }));
});

router.post('/invitations/reject/:invitationId', (req, res) => {
  const invitationId = req.params.invitationId;
  const receiverUsername = req.body.verified_user.username;
  rejectFriendshipInvitation(receiverUsername, invitationId)
    .then(() => res.sendStatus(200))
    .catch(e => res.status(400).json({ message: e.message }));
});

router.post('/invitations/cancel/:invitationId', (req, res) => {
  const invitationId = req.params.invitationId;
  if (invitationId === null) {
    res.status(400).json({
      message: 'you are not giving the invitation id',
    });
  }
  const senderUsername = req.body.verified_user.username;
  cancelFriendshipInvitation(senderUsername, invitationId)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(() => {
      res
        .status(400)
        .json({ message: 'You are not allowed to cancel this invitation.' });
    });
});

export default router;

import { Router } from 'express';
import authenticateToken from '../middlewares/securityMiddleware';
import {
  acceptFriendshipInvitation,
  cancelFriendshipInvitation,
  getAllOpenFriendshipInvitations,
  rejectFriendshipInvitation,
  sendFriendshipInvitation,
} from '../services/friendshipInvitationServices';
import {
  deleteFriend,
  getAllCurrentFriends,
  searchFriend,
} from '../services/frienshipServices';

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

router.post('/invitations/accept', (req, res) => {
  const senderUsername = req.body.username;

  const receiverUsername = req.body.verified_user.username;
  acceptFriendshipInvitation(receiverUsername, senderUsername)
    .then(frienship => res.status(200).json(frienship))
    .catch(e => res.status(400).json({ message: e.message }));
});

router.post('/invitations/reject', (req, res) => {
  const senderUsername = req.body.username;
  const receiverUsername = req.body.verified_user.username;
  rejectFriendshipInvitation(receiverUsername, senderUsername)
    .then(() => res.sendStatus(200))
    .catch(e => res.status(400).json({ message: e.message }));
});

router.post('/invitations/cancel', (req, res) => {
  const receiverUsername = req.body.username;
  if (receiverUsername === null) {
    res.status(400).json({
      message: 'you are not giving the receiver username',
    });
  }
  const senderUsername = req.body.verified_user.username;
  cancelFriendshipInvitation(senderUsername, receiverUsername)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(() => {
      res
        .status(400)
        .json({ message: 'You are not allowed to cancel this invitation.' });
    });
});

router.get('/invitations/open', (req, res) => {
  const currentUsername = req.body.verified_user.username;
  getAllOpenFriendshipInvitations(currentUsername)
    .then(r => res.status(200).json(r))
    .catch(() => res.sendStatus(500));
});

router.get('/friends/all', (req, res) => {
  const currentUsername = req.body.verified_user.username;
  getAllCurrentFriends(currentUsername)
    .then(friends => {
      console.log('friends', friends);
      res.status(200).json({
        friends,
      });
    })
    .catch(() => res.sendStatus(500));
});

router.delete('/friends/delete/:friendUsername', (req, res) => {
  const currentUsername = req.body.verified_user.username;
  deleteFriend(currentUsername, req.params.friendUsername)
    .then(() => res.sendStatus(200))
    .catch(e =>
      res.status(400).json({
        message: e.message,
      }),
    );
});

router.get('/friends/search/:friendUsername', (req, res) => {
  const currentUsername = req.body.verified_user.username;
  searchFriend(currentUsername, req.params.friendUsername)
    .then(f =>
      res.status(200).json({
        best_matches: f,
      }),
    )
    .catch(() => res.sendStatus(500));
});

export default router;

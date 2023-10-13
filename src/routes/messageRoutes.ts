import { Router } from 'express';
import {
  getLatestMessagesHome,
  retrieveLatestDirectMessages,
  sendDirectMessage,
} from '../services/messageServices';
import authenticateToken from '../middlewares/securityMiddleware';

const router = Router();
router.use(authenticateToken);
router.post('/direct', (req, res) => {
  const { to, content } = req.body;
  const from = req.body.verified_user.username;
  sendDirectMessage(from, to, content)
    .then(() => res.status(200).json({ message: 'ok' }))
    .catch(e => {
      res.status(400).json({ message: e.message });
    });
});

router.get('/direct/home', (req, res) => {
  const username = req.body.verified_user.username;
  getLatestMessagesHome(username)
    .then(r => {
      res.status(200).json({ items: r });
    })
    .catch(e => {
      res.status(400).json({ message: e.message });
    });
});

router.get('/direct/latest', (req, res) => {
  const username1 = req.body.verified_user.username;
  const username2 = req.query.username as string;

  if (username1 === username2) {
    res.status(400).json({
      message: 'You can not get messages from yourself',
    });
    return;
  }
  const beforeTimestamp = req.body.before_timestamp;
  retrieveLatestDirectMessages(beforeTimestamp, username1, username2)
    .then(messages => {
      res.status(200).json({
        messages,
      });
    })
    .catch(e => {
      console.log(e);
      res.status(400).json({ message: e.message });
    });
});

export default router;

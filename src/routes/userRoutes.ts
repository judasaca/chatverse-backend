import express from 'express';
import {
  authenticateUser,
  createUser,
  searchUserByUsername,
} from '../services/userServices';
import { toNewUser, toLoginUserInput } from '../utils/userUtils';
import authenticateToken from '../middlewares/securityMiddleware';

const router = express.Router();

router.post('/', (req, res) => {
  const newUserInfo = toNewUser(req.body);
  createUser(newUserInfo)
    .then(() =>
      res.status(200).json({
        status: 'created',
      }),
    )
    .catch(e => {
      console.log(e);
      res.status(400).json({
        status: 'failed',
        message: 'Bad credentials. User or email already exists.',
      });
    });
});

router.get('/info', authenticateToken, (req, res) => {
  const username = req.body.verified_user.username;
  res.json({ username }).status(200);
});

router.post('/login', (req, res) => {
  const userInfo = toLoginUserInput(req.body);
  authenticateUser(userInfo)
    .then(token => {
      res.json({
        status: 'success',
        token: token.token,
        username: token.username,
      });
    })
    .catch(error => {
      console.log(error);
      res.status(400).json({
        status: 'failed',
        message: error.message,
      });
    });
});

router.post('/search', authenticateToken, (req, res) => {
  const searchUsername = req.body.username;
  const currentUsername = req.body.verified_user.username;
  searchUserByUsername(searchUsername, currentUsername)
    .then(matches => {
      res.status(200).json({
        users: matches,
      });
    })
    .catch(e => {
      res.status(400).json({ message: e.message });
    });
});

export default router;

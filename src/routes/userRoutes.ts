import express from 'express';
import { authenticateUser, createUser } from '../services/userServices';
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
  console.log(username);
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

export default router;

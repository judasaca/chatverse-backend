import express from 'express';
import { authenticateUser, createUser } from '../services/userServices';
import { toNewUser, toLoginUserInput } from '../utils/userUtils';

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

router.post('/login', (req, res) => {
  const userInfo = toLoginUserInput(req.body);
  authenticateUser(userInfo)
    .then(token => {
      res.json({
        status: 'success',
        token,
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

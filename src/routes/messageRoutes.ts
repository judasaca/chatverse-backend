import { Router } from 'express';
import { sendDirectMessage } from '../services/messageServices';
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

export default router;

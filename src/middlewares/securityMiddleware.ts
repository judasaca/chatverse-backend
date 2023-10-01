import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.info(req.method, req.originalUrl);
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1] as string;

  if (token == null) {
    res.sendStatus(401);
    return;
  }
  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: any, user: any) => {
      if (err != null) {
        const message = err.message;
        res.status(403).json({
          message,
        });
      } else {
        req.body.verified_user = user;
        next();
      }
    },
  );
};

export default authenticateToken;

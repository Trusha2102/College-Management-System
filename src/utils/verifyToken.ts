import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: { role_id?: number };
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Missing token' });
  }

  let decodedToken: JwtPayload;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_secret_key_here'
    ) as JwtPayload;
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  if (!decodedToken || typeof decodedToken !== 'object') {
    return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
  }

  const { role_id } = decodedToken;
  if (role_id === undefined) {
    return res.status(401).json({ message: 'Unauthorized: Missing role_id in token' });
  }

  // Attach the decoded token to the request object
  req.user = { role_id };

  next();
};

export default verifyToken;

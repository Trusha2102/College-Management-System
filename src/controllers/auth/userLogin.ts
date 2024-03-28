import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../../entity/User';
import AppDataSource from '../../data-source';

const login = async (req: Request, res: Response) => {
  console.log('THE LOGIN API WAS CALLED');
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await AppDataSource.manager.findOne(User, {
      where: { email },
    });
    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Create JWT token with user object as payload
    const token = jwt.sign(
      {
        user,
      },
      process.env.JWT_SECRET || 'your_secret_key_here',
      { expiresIn: '30d' },
    );
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to authenticate user' });
  }
};

export { login };

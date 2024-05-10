import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../../entity/User';
import AppDataSource from '../../data-source';
import { sendResponse, sendError } from '../../utils/commonResponse';
import transporter from '../../services/emailConfig';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await AppDataSource.manager.findOne(User, {
      where: { email },
      relations: ['employee'],
    });
    if (!user) {
      return sendError(res, 202, 'User Not Found!');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return sendError(res, 200, 'Invalid credentials');
    }
    const token = jwt.sign(
      {
        user,
      },
      process.env.JWT_SECRET || '',
      { expiresIn: '30d' },
    );

    sendResponse(res, 200, 'Login successful', { token, user });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to authenticate user');
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, new_password } = req.body;

    // Find the student by email
    const user = await AppDataSource.getRepository(User).findOne({
      where: { email },
    });

    // If user not found, return an error
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await AppDataSource.getRepository(User).save(user);

    // Return a success response
    return sendResponse(res, 200, 'Password reset successful');
  } catch (error: any) {
    console.error(error);
    return sendError(res, 500, 'Failed to reset password', error.message);
  }
};

const forgotPasswordEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Check if email is provided
  if (!email) {
    return sendError(res, 400, 'Email is required');
  }

  const filePath = path.join(
    __dirname,
    '../../..',
    'src/html/forgotPassword.html',
  );

  fs.readFile(filePath, 'utf8', async (err, data) => {
    if (err) {
      console.error(err);
      return sendError(res, 500, 'Failed to read email template');
    }

    // Replace the placeholder with the actual reset password URL
    const resetPasswordUrl =
      process.env.RESET_PASSWORD_URL || 'Error Loading RESET_PASSWORD_URL';
    const html = data.replace('{{resetPasswordUrl}}', resetPasswordUrl);

    // Configure email options
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Reset Your Password',
      html: html,
    };

    try {
      // Send email
      await transporter.sendMail(mailOptions);
      return sendResponse(res, 200, 'Reset password email sent successfully');
    } catch (error) {
      console.error(error);
      return sendError(res, 500, 'Failed to send reset password email');
    }
  });
};

const changePassword = async (req: Request, res: Response) => {
  try {
    const { current_password, new_password, email } = req.body;

    // Check if the request body contains the required fields
    if (!current_password || !new_password) {
      return sendError(res, 400, 'Current and new password are required');
    }

    // Find the user by some identifier (e.g., email or user ID)
    const user = await AppDataSource.getRepository(User).findOne({
      where: { email: email },
    });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Compare the current password with the hashed password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid current password');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the user's password in the database
    user.password = hashedPassword;
    await AppDataSource.getRepository(User).save(user);

    return sendResponse(res, 200, 'Password changed successfully');
  } catch (error: any) {
    sendError(res, 500, 'Internal Server Error', error.message);
  }
};

export { login, resetPassword, forgotPasswordEmail, changePassword };

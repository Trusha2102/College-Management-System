import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import configureMulter from '../../utils/multerConfig';

const prisma = new PrismaClient();

// Specify the upload path
const upload = configureMulter('./uploads/profilePicture');

const createUser = async (req: Request, res: Response) => {
  try {
    const { role_id, ...userData } = req.body;

    // Check if the role_id exists in the Role table
    const role = await prisma.role.findUnique({
      where: { id: role_id }
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const user = await prisma.user.create({
      data: {
        ...userData,
        role: { connect: { id: role_id } },
        dob: new Date(userData.dob),
        address_id: userData.address_id || null,
        bank_details_id: userData.bank_details_id || null,
        profile_picture: ''
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create user' });
  }
};

const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    upload.single('profile_picture')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }

      const { id } = req.params;

      // Update the user's profile_picture field with the path of the uploaded image
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { profile_picture: req.file?.path }
      });

      res
        .status(200)
        .json({ message: 'Profile picture uploaded and user profile updated successfully', user });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { is_active: true }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getAllDeletedUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { is_active: false }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id), is_active: true }
    });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

const updateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, ...userData } = req.body;

    // Check if the new email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: email, NOT: { id: parseInt(id) } }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...userData,
        email,
        dob: new Date(userData.dob),
        address_id: userData.address_id || null,
        bank_details_id: userData.bank_details_id || null
      }
    });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { is_active: false }
    });
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to soft delete user' });
  }
};

export {
  createUser,
  uploadProfilePicture,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getAllDeletedUsers
};

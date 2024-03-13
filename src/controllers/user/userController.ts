import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import configureMulter from '../../utils/multerConfig';
import { parse } from 'path';

const prisma = new PrismaClient();

// Specify the upload path
const upload = configureMulter('./uploads/profilePicture');

const createUser = async (req: Request, res: Response) => {
  try {
    upload.single('profile_picture')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }

      // Now that multer has parsed the form data, you can access req.body
      const { role_id, social_media_links, address_id, bank_details_id, ...userData } = req.body;

      // Check if the role_id exists in the Role table
      const role = await prisma.role.findUnique({
        where: { id: parseInt(role_id) }
      });

      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      // Parse marital_status as boolean
      const marital_status = userData.marital_status === 'true';

      // Parse social_media_links as array
      const parsedSocialMediaLinks = social_media_links.split(',');

      // Parse address_id and bank_details_id
      const parsedAddressId = address_id === 'null' ? null : address_id;
      const parsedBankAccountId = bank_details_id === 'null' ? null : bank_details_id;

      // Create the user with the provided data and the path of the uploaded image
      const user = await prisma.user.create({
        data: {
          ...userData,
          is_active: true,
          marital_status,
          role: { connect: { id: parseInt(role_id) } },
          dob: new Date(userData.dob),
          profile_picture: req.file?.path || '',
          social_media_links: parsedSocialMediaLinks,
          address_id: parsedAddressId,
          bank_details_id: parsedBankAccountId
        }
      });

      res
        .status(201)
        .json({ user, message: 'User created and profile picture uploaded successfully' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create user or upload profile picture' });
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
    upload.single('profile_picture')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }

      const userId = parseInt(req.params.id);
      const { role_id, social_media_links, address_id, bank_details_id, ...userData } = req.body;

      // Check if the role_id exists in the Role table
      const role = await prisma.role.findUnique({
        where: { id: parseInt(role_id) }
      });

      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }

      // Parse marital_status as boolean
      const marital_status = userData.marital_status === 'true';

      // Parse social_media_links as array
      const parsedSocialMediaLinks = social_media_links.split(',');

      // Parse address_id and bank_details_id
      const parsedAddressId = address_id === 'null' ? null : address_id;
      const parsedBankAccountId = bank_details_id === 'null' ? null : bank_details_id;

      // Update the user with the provided data
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...userData,
          is_active: true,
          marital_status,
          role: { connect: { id: parseInt(role_id) } },
          dob: new Date(userData.dob),
          social_media_links: parsedSocialMediaLinks,
          address_id: parsedAddressId,
          bank_details_id: parsedBankAccountId,
          profile_picture: req.file?.path || ''
        }
      });

      res.status(200).json({ user: updatedUser, message: 'User updated successfully' });
    });
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

export { createUser, getAllUsers, getUserById, updateUserById, deleteUserById, getAllDeletedUsers };

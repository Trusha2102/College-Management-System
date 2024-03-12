import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

const prisma = new PrismaClient();

// Check if the 'uploads' folder exists, and create it if it doesn't
const uploadsFolder = './uploads';
if (!existsSync(uploadsFolder)) {
  mkdirSync(uploadsFolder);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder); // Use the 'uploads' folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); // File naming
  }
});

const upload = multer({ storage });

const createUser = async (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      father_name,
      mother_name,
      email,
      mobile,
      password,
      is_active,
      gender,
      dob,
      marital_status,
      qualification,
      work_experience,
      address_id,
      bank_details_id,
      social_media_links,
      role_id
    } = req.body;

    // Check if the role_id exists in the Role table
    const role = await prisma.role.findUnique({
      where: { id: role_id }
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        father_name,
        mother_name,
        email,
        mobile,
        password,
        role: { connect: { id: role_id } },
        is_active,
        gender,
        dob: new Date(dob),
        marital_status,
        qualification,
        work_experience,
        address_id: address_id || null,
        bank_details_id: bank_details_id || null,
        social_media_links,
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

      // If the file was uploaded and user profile was updated successfully, respond with a success message
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
  console.log('here');
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
    const {
      first_name,
      last_name,
      father_name,
      mother_name,
      email,
      mobile,
      password,
      role_id,
      profile_picture,
      is_active,
      gender,
      dob,
      marital_status,
      qualification,
      work_experience,
      address_id,
      bank_details_id,
      social_media_links
    } = req.body;

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
        first_name,
        last_name,
        father_name,
        mother_name,
        email,
        mobile,
        password,
        role_id,
        profile_picture,
        is_active,
        gender,
        dob,
        marital_status,
        qualification,
        work_experience,
        address_id,
        bank_details_id,
        social_media_links
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

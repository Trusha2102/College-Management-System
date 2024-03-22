import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import AppDataSource from '../../data-source';
import { User } from '../../entity/User';
import { Role } from '../../entity/Role';
import { sendResponse, sendError } from '../../utils/commonResponse';
import configureMulter from '../../utils/multerConfig';
import multer from 'multer';

const upload = configureMulter('./uploads/profilePicture', 5 * 1024 * 1024); // 5MB limit

const createUser = async (req: Request, res: Response) => {
  try {
    upload.single('profile_picture')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        if (err instanceof multer.MulterError) {
          return sendError(res, 400, 'File upload error: ' + err.message);
        } else {
          return sendError(res, 500, 'Failed to upload profile picture');
        }
      }
      if (!req.file) {
        return sendError(res, 400, 'No file uploaded');
      }

      const {
        role_id,
        social_media_links,
        address_id,
        bank_details_id,
        password,
        ...userData
      } = req.body;

      const role = await AppDataSource.manager.findOne(Role, {
        where: { id: parseInt(role_id, 10) },
      });
      if (!role) {
        return sendError(res, 404, 'Role not found');
      }

      const marital_status = userData.marital_status === 'true';
      const parsedSocialMediaLinks = social_media_links.split(',');
      const parsedAddressId =
        address_id === 'null' ? null : parseInt(address_id);
      const parsedBankAccountId =
        bank_details_id === 'null' ? null : parseInt(bank_details_id);

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User();
      user.first_name = userData.first_name;
      user.last_name = userData.last_name;
      user.father_name = userData.father_name;
      user.mother_name = userData.mother_name;
      user.email = userData.email;
      user.password = hashedPassword;
      user.is_active = true;
      user.marital_status = marital_status;
      user.gender = userData.gender;
      user.qualification = userData.qualification;
      user.work_experience = userData.work_experience;
      user.aadhar_card = userData.aadhar_card;
      user.role_id = role_id;
      user.mobile = userData.mobile;
      user.dob = new Date(userData.dob);
      user.profile_picture = req.file.path;
      user.social_media_links = parsedSocialMediaLinks;
      user.address_id = parsedAddressId as number;
      user.bank_details_id = parsedBankAccountId as number;

      await AppDataSource.manager.save(user);

      sendResponse(res, 201, 'User', {
        user,
        message: 'User created and profile picture uploaded successfully',
      });
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to create user or upload profile picture');
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await AppDataSource.manager.find(User, {
      where: { is_active: true },
    });
    sendResponse(res, 200, 'Users', users);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch users');
  }
};

const getAllDeletedUsers = async (req: Request, res: Response) => {
  try {
    const users = await AppDataSource.manager.find(User, {
      where: { is_active: false },
    });
    sendResponse(res, 200, 'Deleted Users', users);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch deleted users');
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await AppDataSource.manager.findOneOrFail(User, {
      where: { id: userId, is_active: true },
    });
    sendResponse(res, 200, 'User', user);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to fetch user');
  }
};
const updateUserById = async (req: Request, res: Response) => {
  try {
    upload.single('profile_picture')(req, res, async (err: any) => {
      if (err) {
        console.error(err);
        if (err instanceof multer.MulterError) {
          return sendError(res, 400, 'File upload error: ' + err.message);
        } else {
          return sendError(res, 500, 'Failed to upload profile picture');
        }
      }
      if (!req.file) {
        return sendError(res, 400, 'No file uploaded');
      }
      const userId = parseInt(req.params.id);
      const {
        role_id,
        social_media_links,
        address_id,
        bank_details_id,
        ...userData
      } = req.body;

      const role = await AppDataSource.manager.findOne(Role, {
        where: { id: parseInt(role_id) },
      });
      if (!role) {
        return sendError(res, 404, 'Role not found');
      }

      const marital_status = userData.marital_status === 'true';
      const parsedSocialMediaLinks = social_media_links.split(',');
      const parsedAddressId =
        address_id === 'null' ? null : parseInt(address_id);
      const parsedBankAccountId =
        bank_details_id === 'null' ? null : parseInt(bank_details_id);

      const user = await AppDataSource.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      user.first_name = userData.first_name || user.first_name;
      user.last_name = userData.last_name || user.last_name;
      user.father_name = userData.father_name || user.father_name;
      user.mother_name = userData.mother_name || user.mother_name;
      user.email = userData.email || user.email;
      user.is_active = userData.is_active === 'true';
      user.marital_status = marital_status;
      user.gender = userData.gender || user.gender;
      user.qualification = userData.qualification || user.qualification;
      user.work_experience = userData.work_experience || user.work_experience;
      user.aadhar_card = userData.aadhar_card || user.aadhar_card;
      user.role = role;
      user.mobile = userData.mobile || user.mobile;
      user.dob = new Date(userData.dob) || user.dob;
      user.profile_picture = req.file.path;
      user.social_media_links =
        parsedSocialMediaLinks || user.social_media_links;
      user.address_id = parsedAddressId || user.address_id;
      user.bank_details_id = parsedBankAccountId || user.bank_details_id;

      await AppDataSource.manager.save(user);

      sendResponse(res, 200, 'User', {
        user,
        message: 'User updated successfully',
      });
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update user');
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await AppDataSource.manager.findOne(User, {
      where: { id: userId },
    });
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    user.is_active = false;
    await AppDataSource.manager.save(user);
    sendResponse(res, 200, 'User', user);
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to soft delete user');
  }
};

export {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getAllDeletedUsers,
};

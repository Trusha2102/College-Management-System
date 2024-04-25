import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import AppDataSource from '../../data-source';
import { User } from '../../entity/User';
import { Role } from '../../entity/Role';
import { sendResponse, sendError } from '../../utils/commonResponse';
import configureMulter from '../../utils/multerConfig';
import multer from 'multer';
import runTransaction from '../../utils/runTransaction';

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

      let profilePicturePath = '';
      if (req.file) {
        profilePicturePath = req.file.path;
      }

      const {
        role_id,
        social_media_links,
        address_id,
        bank_details_id,
        password,
        ...userData
      } = req.body;

      // Check if the email already exists
      const existingUser = await AppDataSource.manager.findOne(User, {
        where: { email: userData.email },
      });
      if (existingUser) {
        return sendError(res, 400, 'Email address already exists');
      }

      const role = await AppDataSource.manager.findOne(Role, {
        where: { id: +role_id },
      });
      if (!role) {
        return sendError(res, 404, 'Role not found');
      }

      let parsedSocialMediaLinks;
      if (social_media_links) {
        parsedSocialMediaLinks = social_media_links.split(',');
      }

      const parsedAddressId = address_id === 'null' ? null : +address_id;
      const parsedBankAccountId =
        bank_details_id === 'null' ? null : +bank_details_id;

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User();
      user.first_name = userData.first_name;
      user.last_name = userData.last_name;
      user.father_name = userData.father_name;
      user.mother_name = userData.mother_name;
      user.email = userData.email;
      user.password = hashedPassword;
      user.is_active = true;
      user.marital_status = userData.marital_status === 'true';
      user.gender = userData.gender;
      user.qualification = userData.qualification;
      user.work_experience = userData.work_experience;
      user.aadhar_card = userData.aadhar_card;
      user.role_id = role_id;
      user.role = role_id;
      user.mobile = userData.mobile;
      user.dob = new Date(userData.dob);
      user.profile_picture = profilePicturePath;
      user.social_media_links = parsedSocialMediaLinks || null;
      user.bank_details_id = parsedBankAccountId as number;

      const queryRunner = AppDataSource.createQueryRunner();
      await runTransaction(queryRunner, async () => {
        await queryRunner.manager.save(user);
      });

      sendResponse(res, 201, 'User', {
        user,
        message: 'User created and profile picture uploaded successfully',
      });
    });
  } catch (error: any) {
    console.error(error);
    return sendError(
      res,
      500,
      'Failed to create user or upload profile picture',
      error.message,
    );
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;

    // Convert page and limit parameters to numbers
    const pageNumber = page ? parseInt(page as string) : 1;
    const limitNumber = limit ? parseInt(limit as string) : 10;

    // Calculate offset based on page number and limit
    const offset = (pageNumber - 1) * limitNumber;

    // Fetch users with pagination and total count
    const [users, totalCount] = await AppDataSource.manager.findAndCount(User, {
      where: { is_active: true },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limitNumber,
    });

    const totalNoOfRecords = users.length;

    sendResponse(res, 200, 'Users', {
      users,
      totalNoOfRecords,
      totalCount,
    });
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
    const userId = req.params.id;

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: +userId, is_active: true },
    });

    if (!user) {
      sendError(res, 400, 'User Not Found', null);
      return;
    }

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

      const userId = req.params.id;
      const userData = req.body;

      const marital_status = userData.marital_status === 'true';

      const user = await AppDataSource.manager.findOne(User, {
        where: { id: +userId },
      });
      if (!user) {
        return sendError(res, 404, 'User not found');
      }

      Object.assign(user, userData);

      user.marital_status = marital_status;

      if (req.file) {
        user.profile_picture = req.file.path;
      }

      await AppDataSource.manager.update(User, userId, user);

      sendResponse(res, 200, 'User updated successfully', {
        user,
      });
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Failed to update user');
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await AppDataSource.manager.findOne(User, {
      where: { id: +userId },
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

// import { Request, Response, NextFunction } from 'express';
// import { plainToClass } from 'class-transformer';
// import { validate } from 'class-validator';
// import { CreateNoticeDto } from '../dto/createNoticeDto';
// import { sendError } from '../utils/commonResponse';

// export const validateCreateNotice = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//       const { title } = req.body;

//     const createNoticeDto = new CreateNoticeDto();
//     createNoticeDto.title = req.body.title;
//     createNoticeDto.noticeDate = req.body.noticeDate;
//     createNoticeDto.publishOn = req.body.publishOn;
//     createNoticeDto.messageTo = req.body.messageTo;
//     createNoticeDto.message = req.body.message;

//     const errors = await validate(createNoticeDto);

//     if (errors.length > 0) {
//       const errorMessages = errors
//         .map((error) => Object.values(error.constraints || {}))
//         .flat();
//       return sendError(res, 400, 'Error in Validation', errorMessages);
//     }

//     next();
//   } catch (error) {
//     console.error('Error in validation middleware:', error);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Internal server error' });
//   }
// };

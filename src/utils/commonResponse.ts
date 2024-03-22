import { Response } from 'express';

export const sendResponse = (res: Response, statusCode: number, message: string, data?: any) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

//Sample Usage
//sendResponse(res, 200, 'Success', { key: 'value' });

export const sendError = (res: Response, statusCode: number, message: string, error?: any) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error
  });
};

//Sample Usage
//sendError(res, 500, 'Internal Server Error', 'Something went wrong');

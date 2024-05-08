import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import pdf from 'html-pdf';
import ejs from 'ejs';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Payroll } from '../../entity/Payroll'; // Import your Payroll entity
import AppDataSource from '../../data-source';
import { ILike } from 'typeorm';

export const payrollReport = async (req: Request, res: Response) => {
  try {
    const { if_pdf_download, search } = req.query;

    const payrollRepository = AppDataSource.getRepository(Payroll);

    let filter: any = {}; // Start with an empty filter

    // if (search) {
    //   filter = {
    //     ...filter,
    //     where: [{ employee: ILike(`%${search}%`) }],
    //   };
    // }

    let payroll;

    if (if_pdf_download) {
      payroll = await payrollRepository.find({
        where: filter,
        relations: [
          'employee',
          'employee.user',
          'employee.user.role',
          'employee.designation',
        ],
      });
      const htmlContent = await ejs.renderFile(ejsFilePath, { payroll });

      const pdfOptions: pdf.CreateOptions = {
        format: 'A4',
        border: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
        },
        footer: {
          height: '15mm',
          contents: {
            default:
              '<div style="text-align:center;"><span>{{page}} of {{pages}}</span></div>',
          },
        },
      };

      const uploadFolder = path.join(__dirname, '../../../', 'uploads/Report');
      if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(uploadFolder, { recursive: true });
      }
      const pdfFileName = `payroll_report_${Date.now()}.pdf`;
      const pdfFilePath = path.join(uploadFolder, pdfFileName);
      await generatePDF(htmlContent, pdfOptions, pdfFilePath);

      const relativePath = path.relative(
        path.join(__dirname, '../../../'),
        pdfFilePath,
      );

      return sendResponse(res, 200, 'PDF generated successfully', {
        pdfFilePath: '/' + relativePath,
      });
    } else {
      payroll = await payrollRepository.find(filter);

      return sendResponse(res, 200, 'Payroll records retrieved successfully', {
        payroll,
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return sendError(res, 500, 'Internal Server Error');
  }
};

const ejsFilePath = path.join(
  __dirname,
  '../../../',
  'src',
  'html',
  'payrollReport.ejs',
);

const generatePDF = async (
  htmlContent: string,
  pdfOptions: pdf.CreateOptions,
  pdfFilePath: string,
) => {
  const options: pdf.CreateOptions = {
    ...pdfOptions,
    childProcessOptions: {
      //@ts-ignore
      env: {
        ...process.env,
        OPENSSL_CONF: '/dev/null',
      },
    },
  };
  return new Promise<void>((resolve, reject) => {
    pdf.create(htmlContent, options).toFile(pdfFilePath, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

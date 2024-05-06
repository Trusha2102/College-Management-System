import { Request, Response } from 'express';
import { Between, ILike } from 'typeorm';
import path from 'path';
import fs from 'fs';
import pdf from 'html-pdf';
import ejs from 'ejs';
import { sendResponse, sendError } from '../../utils/commonResponse';
import { Income } from '../../entity/Income';
import AppDataSource from '../../data-source';

export const incomeReport = async (req: Request, res: Response) => {
  try {
    const { date_from, date_to, if_pdf_download, page, limit, search } =
      req.query;

    if (!date_from || !date_to) {
      return sendError(res, 400, 'Both date_from and date_to are required.');
    }

    const incomeRepository = AppDataSource.getRepository(Income);

    const fromDate = date_from.toString();
    const toDate = date_to.toString();

    let filter: any = {
      createdAt: Between(new Date(fromDate), new Date(toDate)),
    };

    if (search) {
      filter = {
        ...filter,
        where: [
          { name: ILike(`%${search}%`) },
          { invoice_number: ILike(`%${search}%`) },
        ],
        relations: ['income_head'],
      };
    }

    let totalCount = 0;
    let totalNoOfRecords = 0;
    let incomes;

    if (if_pdf_download) {
      incomes = await incomeRepository.find({
        where: filter,
        relations: ['income_head'],
      });

      const htmlContent = await ejs.renderFile(ejsFilePath, { incomes });

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
      const pdfFileName = `income_report_${Date.now()}.pdf`;
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
      totalCount = await incomeRepository.count(filter);
      totalNoOfRecords = totalCount;

      if (page && limit) {
        const skip = (+page - 1) * +limit;
        const take = +limit;
        incomes = await incomeRepository.find({
          ...filter,
          skip,
          take,
        });
        totalNoOfRecords = incomes.length;
      } else {
        incomes = await incomeRepository.find(filter);
      }

      return sendResponse(res, 200, 'Income records retrieved successfully', {
        incomes,
        totalCount,
        totalNoOfRecords,
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
  'incomeReport.ejs',
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

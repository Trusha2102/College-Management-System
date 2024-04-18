import { Request, Response } from 'express';
import { Twilio } from 'twilio';
import { Student } from '../../entity/Student';
import AppDataSource from '../../data-source';

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN_TWILIO;
const twilioPhoneNumber = process.env.SMS_PHONE_NUMBER;

const twilioClient = new Twilio(accountSid, authToken);

export const sendSMS = async (req: Request, res: Response) => {
  try {
    const { studentIds, message } = req.body;

    // Ensure studentIds is an array
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'studentIds must be an array' });
    }

    const studentRepository = await AppDataSource.getRepository(Student);

    // Iterate over each student ID
    for (const studentId of studentIds) {
      // Fetch student from the database based on the studentId
      const student = await studentRepository.findOne({
        where: { id: studentId },
      });

      // Ensure the student exists and has a mobile number
      if (!student || !student.mobile) {
        console.error(
          `Student with ID ${studentId} not found or does not have a mobile number`,
        );
        continue;
      }

      // Send SMS using Twilio
      await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: student.mobile,
      });

      console.log(
        `SMS sent to student with ID ${studentId} at ${student.mobile}`,
      );
    }

    res.status(200).json({ message: 'SMS sent successfully' });
  } catch (error) {
    console.error('Failed to send SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
};

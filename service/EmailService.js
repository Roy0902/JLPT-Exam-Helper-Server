import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class emailService {
  async sendOtpEmail(email, otp) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    };

    try {
      const res = await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error('Failed to send OTP email');
    }
  }
}

export default new emailService();
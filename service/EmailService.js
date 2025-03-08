import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class EmailService {
  async sendOtpEmail(email, otp) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    };
    await transporter.sendMail(mailOptions);
  }
}

export default new EmailService();
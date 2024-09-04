import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/modules/user/models/user.entity';
import { Result } from '@/common/dto/result.type';
import { REGISTER_ERROR } from '@/common/constants/code';

@Injectable()
export class EmailVerificationService {
  constructor(private jwtService: JwtService) {}

  generateVerificationToken(email: string): string {
    const token = this.jwtService.sign({ email }, { expiresIn: '30m' });
    return token;
  }

  async sendVerificationEmail(user: User): Promise<Result> {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not found.');
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });

    try {
      await transporter.verify();
    } catch (error) {
      console.error('Failed to connect to email server:', error);
    }

    // TODO: link will be updated once api server is deployed, currently this url is for local development only
    const verificationLink = `http://localhost:3010/verify-email?email=${user.email}&token=${user.verificationToken}`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Verify Your Email',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #007bff">
          <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
          <p style="color: #666;">Thank you for signing up with BeeQuant AI! To complete your registration, please click the link below to verify your email address:</p>
          <div style="text-align: center;">
            <a href="${verificationLink}" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Verify Email</a>
          </div>
          <p style="color: #666; margin-top: 20px;">If you did not request this verification, you can safely ignore this email.</p>
        </div>
        
        `,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        code: REGISTER_ERROR,
        message: 'Email verification failed',
      };
    }
  }
}

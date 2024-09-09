import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/modules/user/models/user.entity';
import { Result } from '@/common/dto/result.type';
import { SEND_EMAIL_ERROR, SUCCESS } from '@/common/constants/code';

@Injectable()
export class EmailVerificationService {
  constructor(private jwtService: JwtService) {}

  generateVerificationToken(email: string): string {
    const token = this.jwtService.sign({ email }, { expiresIn: '30m' });
    return token;
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<Result> {
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

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
      return {
        code: SUCCESS,
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        code: SEND_EMAIL_ERROR,
        message: 'Email sending failed',
      };
    }
  }

  async sendVerificationEmail(user: User): Promise<Result> {
    // TODO: link will be updated once api server is deployed, currently this url is for local development only
    const verificationLink = `http://localhost:3010/verify-email?email=${user.email}&token=${user.verificationToken}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #007bff">
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p style="color: #666;">Thank you for signing up with BeeQuant AI! To complete your registration, please click the link below to verify your email address:</p>
        <div style="text-align: center;">
          <a href="${verificationLink}" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Verify Email</a>
        </div>
        <p style="color: #666; margin-top: 20px;">If you did not request this verification, you can safely ignore this email.</p>
      </div>
      `;
    return this.sendEmail(user.email, 'Verify Your Email', htmlContent);
  }

  async sendResetPasswordEmail(user: User): Promise<Result> {
    // TODO: link will be updated once api server is deployed, currently this url is for local development only
    const resetPasswordLink = `http://localhost:3010/reset-password?token=${user.resetPasswordToken}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #007bff">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p style="color: #666;">Thank you for using BeeQuant AI! We have received a request to reset your password. To proceed, please click the link below:</p>
        <div style="text-align: center;">
          <a href="${resetPasswordLink}" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Reset Password</a>
        </div>
        <p style="color: #666; margin-top: 20px;">If you did not request this change, you can safely ignore this email.</p>
      </div>
    `;
    return this.sendEmail(user.email, 'Reset Your Password', htmlContent);
  }
}

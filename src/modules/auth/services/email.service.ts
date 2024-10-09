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
    return this.jwtService.sign({ email }, { expiresIn: '30m' });
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
    const verificationLink = `http://beequantai.net/verify-email?email=${user.email}&token=${user.verificationToken}`;
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
    const resetPasswordLink = `http://beequantai.net/reset-password?token=${user.resetPasswordToken}`;
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

  async sendOAuthPasswordEmail(email: string, password: string): Promise<Result> {
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #007bff">
      <h2 style="color: #333; text-align: center;">Your OAuth Account Password</h2>
      <p style="color: #666;">Thank you for using BeeQuant AI! You can log in using OAuth, or alternatively, you can log in using the following temporary password:</p>
      <div style="text-align: center;">
        <p style="background-color: #f2f2f2; padding: 10px; border-radius: 5px; display: inline-block; font-size: 18px; color: #333;">
          ${password}
        </p>
      </div>
      <p style="color: #666; margin-top: 20px;">Please keep this password safe and do not share it with anyone.</p>
      <p style="color: #666; margin-top: 20px;">After logging in, we recommend changing your password from Account Management.</p>
      <p style="color: #666; margin-top: 20px;">If you did not request this account, you can safely ignore this email.</p>
    </div>
  `;
    return this.sendEmail(email, 'Your OAuth Account Password', htmlContent);
  }
}

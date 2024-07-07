import * as bcrypt from 'bcryptjs';
import { Injectable, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../user/dto/new-user.input';
import { UserService } from '../user/user.service';
import { Result } from '@/common/dto/result.type';
import { EmailVerificationService } from './email.service';
import { VERIFY_ERROR } from '@/common/constants/code';
import { emailPattern } from '@/common/utils/helpers';
import { UpdatePasswordInput } from '../user/dto/update-password.input';
import * as dotenv from 'dotenv';
dotenv.config();

import {
  ACCOUNT_EXIST,
  ACCOUNT_NOT_EXIST,
  ACCOUNT_NOT_VERIFIED,
  LOGIN_ERROR,
  REGISTER_ERROR,
  SUCCESS,
  UPDATE_PASSWORD_ERROR,
  UNKNOWN_ERROR,
} from '@/common/constants/code';

@Injectable()
export class AuthService {
  constructor(
    private emailVerificationService: EmailVerificationService,
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async login(
    email: string,
    password: string,
    stay_signed_in: boolean,
    @Res() res: Response,
  ): Promise<Result> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return {
        code: ACCOUNT_NOT_EXIST,
        message: "account doesn't exist",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = this.jwtService.sign({ id: user.id });

      if (!user.isEmailVerified) {
        const verificationToken =
          this.emailVerificationService.generateVerificationToken(user.email);
        await this.userService.update(user.id, {
          verificationToken
        });
        const registeredUser = await this.userService.findByEmail(user.email);
        await this.emailVerificationService.sendVerificationEmail(
          registeredUser
        );
        return {
          code: ACCOUNT_NOT_VERIFIED,
          message:
            'Email verification required. A new verification email will be sent shortly.',
        };
      }

      const accessToken = this.jwtService.sign(
        { id: user.id },
        { secret: process.env.JWT_SECRET, expiresIn: '12h' }
      );

      if (stay_signed_in) {
        const refreshToken = this.jwtService.sign(
          { id: user.id },
          { secret: process.env.JWT_SECRET, expiresIn: '7d' }
        );
        await this.userService.update(user.id, { refreshToken });
      } else {
        await this.userService.update(user.id, { refreshToken: null });
      }

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 12 * 60 * 60 * 1000,
        sameSite: 'none',
      });

      return {
        code: SUCCESS,
        message: 'login successful',
      };
    }
    return {
      code: LOGIN_ERROR,
      message: 'login failed, wrong password',
    };
  }

  async register(input: CreateUserInput): Promise<Result> {
    const user = await this.userService.findByEmail(input.email);
    if (user) {
      return {
        code: ACCOUNT_EXIST,
        message: 'account already exists',
      };
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const verificationToken =
      this.emailVerificationService.generateVerificationToken(input.email);
    const res = await this.userService.create({
      ...input,
      password: hashedPassword,
      isEmailVerified: false,
      verificationToken,
    });
    const registeredUser = await this.userService.findByEmail(input.email);
    if (res) {
      await this.emailVerificationService.sendVerificationEmail(registeredUser);
      return {
        code: SUCCESS,
        message:
          'register successfully. An email has been sent to your email address for verification',
      };
    }

    return {
      code: REGISTER_ERROR,
      message: 'registration failed',
    };
  }

  async verifyEmail(email: string, token: string): Promise<Result> {
    try {
      if (!emailPattern.test(email)) {
        return { code: VERIFY_ERROR, message: 'Invalid Link' };
      }

      const user = await this.userService.findByEmail(email);
      if (!user) {
        return { code: VERIFY_ERROR, message: 'User not found' };
      }

      if (user.isEmailVerified === true) {
        return {
          code: VERIFY_ERROR,
          message: 'Email is already verified, please login'
        }
      }

      try {
        this.jwtService.verify(token);
      } catch (error) {
        const verificationToken =
          this.emailVerificationService.generateVerificationToken(user.email);
        await this.userService.update(user.id, {
          verificationToken
        });
        const registeredUser = await this.userService.findByEmail(user.email);
        await this.emailVerificationService.sendVerificationEmail(
          registeredUser
        );

        if (error.name === 'TokenExpiredError') {
          return {
            code: VERIFY_ERROR,
            message:
              'Link expired, a new verification email will be sent shortly.'
          };
        }

        return {
          code: VERIFY_ERROR,
          message:
            'Invalid Link, a new verification email will be sent shortly.'
        };
      }

      if (!user.verificationToken || user.verificationToken !== token) {
        const verificationToken =
          this.emailVerificationService.generateVerificationToken(user.email);
        await this.userService.update(user.id, {
          verificationToken
        });
        const registeredUser = await this.userService.findByEmail(user.email);
        await this.emailVerificationService.sendVerificationEmail(
          registeredUser
        );
        return {
          code: VERIFY_ERROR,
          message:
            'Invalid Link, a new verification email will be sent shortly.'
        };
      }

      await this.userService.update(user.id, {
        isEmailVerified: true,
        verificationToken: null
      });

      return { code: 200, message: 'Verification successful, please login' };
    } catch (error) {
      return {
        code: VERIFY_ERROR,
        message: 'An error occurred while verifying email.'
      }
    }
  }
  
  async refreshAccessToken(userId: string): Promise<string | null> {
    try {
      const user = await this.userService.find(userId)

      if (!user) return null

      let newAccessToken;
      const decodedRefreshToken = this.jwtService.verify(user.refreshToken, {
        secret: process.env.JWT_SECRET
      });

      if (decodedRefreshToken && decodedRefreshToken.id) {
        newAccessToken = this.jwtService.sign(
          { id: userId },
          { secret: process.env.JWT_SECRET, expiresIn: '12h' }
        );
      }

      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      return null;
    }
  }

  async changePassword(
    cxt: { req: Partial<Request> & { user: { id: string } } },
    input: UpdatePasswordInput
  ): Promise<Result> {
    try {
      const id = cxt.req.user.id;
      const user = await this.userService.find(id);
      if (!user) {
        return {
          code: ACCOUNT_NOT_EXIST,
          message: "account doesn't exist",
        };
      }
      const isPasswordValid = await bcrypt.compare(
        input.oldPassword,
        user.password
      );
      if (!isPasswordValid) {
        return {
          code: LOGIN_ERROR,
          message: 'the current password is incorrect',
        };
      }
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      const res = await this.userService.update(id, {
        password: hashedPassword
      });
      if (res) {
        return {
          code: SUCCESS,
          message: 'password updated',
        };
      } else {
        return {
          code: UPDATE_PASSWORD_ERROR,
          message: 'password update failed',
        };
      }
    } catch (error) {
      return {
        code: UNKNOWN_ERROR,
        message: 'an unexpected error occurred during password update',
      };
    }
  }
<<<<<<< HEAD
}
=======

}
>>>>>>> fc1d82e (backup)

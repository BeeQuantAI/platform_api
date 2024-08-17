import * as bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../user/dto/new-user.input';
import { UserService } from '../user/user.service';
import { Result } from '@/common/dto/result.type';
import { EmailVerificationService } from './email.service';
import { VERIFY_ERROR } from '@/common/constants/code';
import { UpdatePasswordInput } from '../user/dto/update-password.input';
import { ResetPasswordInput } from '../user/dto/reset-password.input';
import { TokenService } from './token.service';
import {
  ACCOUNT_EXIST,
  ACCOUNT_NOT_EXIST,
  ACCOUNT_NOT_VERIFIED,
  LOGIN_ERROR,
  REGISTER_ERROR,
  SUCCESS,
  UPDATE_PASSWORD_ERROR,
  UNKNOWN_ERROR,
  RESET_PASSWORD_ERROR,
} from '@/common/constants/code';

@Injectable()
export class AuthService {
  constructor(
    private emailVerificationService: EmailVerificationService,
    private userService: UserService,
    private jwtService: JwtService,
    private tokenService: TokenService
  ) {}

  async login(email: string, password: string, isStaySignedIn: boolean): Promise<Result> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return {
        code: ACCOUNT_NOT_EXIST,
        message: "account doesn't exist",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      if (!user.isEmailVerified) {
        const verificationToken = this.emailVerificationService.generateVerificationToken(
          user.email
        );
        await this.userService.update(user.id, {
          verificationToken,
        });
        const registeredUser = await this.userService.findByEmail(user.email);
        await this.emailVerificationService.sendVerificationEmail(registeredUser);
        return {
          code: ACCOUNT_NOT_VERIFIED,
          message: 'Email verification required. A new verification email will be sent shortly.',
        };
      }

      const periodOneDay = 1000 * 60 * 60 * 24;
      const periodOneWeek = periodOneDay * 7;
      const expiresFreshToken = isStaySignedIn ? periodOneWeek : periodOneDay;
      const accessToken = this.jwtService.sign({ id: user.id }, { expiresIn: '1h' });
      const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: expiresFreshToken });
      await this.userService.update(user.id, { refreshToken, accessToken });

      return {
        code: SUCCESS,
        message: 'login successful',
        data: accessToken,
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

    const verificationToken = this.emailVerificationService.generateVerificationToken(input.email);
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
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return { code: VERIFY_ERROR, message: 'User not found' };
      }

      if (user.isEmailVerified === true) {
        return {
          code: VERIFY_ERROR,
          message: 'Email is already verified, please login',
        };
      }

      try {
        this.jwtService.verify(token);
      } catch (error) {
        const verificationToken = this.emailVerificationService.generateVerificationToken(
          user.email
        );
        await this.userService.update(user.id, {
          verificationToken,
        });
        const registeredUser = await this.userService.findByEmail(user.email);
        await this.emailVerificationService.sendVerificationEmail(registeredUser);

        if (error.name === 'TokenExpiredError') {
          return {
            code: VERIFY_ERROR,
            message: 'Verify link expired',
          };
        }

        return {
          code: VERIFY_ERROR,
          message: 'Invalid verify link',
        };
      }

      if (!user.verificationToken || user.verificationToken !== token) {
        const verificationToken = this.emailVerificationService.generateVerificationToken(
          user.email
        );
        await this.userService.update(user.id, {
          verificationToken,
        });
        const registeredUser = await this.userService.findByEmail(user.email);
        await this.emailVerificationService.sendVerificationEmail(registeredUser);
        return {
          code: VERIFY_ERROR,
          message: 'Invalid verify link',
        };
      }

      await this.userService.update(user.id, {
        isEmailVerified: true,
        verificationToken: null,
      });

      return { code: 200, message: 'Verification successful, please login' };
    } catch (error) {
      return {
        code: VERIFY_ERROR,
        message: 'An error occurred while verifying email.',
      };
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
      const isPasswordValid = await bcrypt.compare(input.oldPassword, user.password);
      if (!isPasswordValid) {
        return {
          code: LOGIN_ERROR,
          message: 'the current password is incorrect',
        };
      }
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);
      const res = await this.userService.update(id, {
        password: hashedPassword,
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

  async forgotPassword(email: string): Promise<Result> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return {
          code: RESET_PASSWORD_ERROR,
          message: "account doesn't exist",
        };
      }

      const resetPasswordToken = this.emailVerificationService.generateVerificationToken(email);
      const res = await this.userService.update(user.id, {
        resetPasswordToken,
      });
      if (res) {
        // re-query user to get the updated resetPasswordToken from database, cuz the `user` query before is a cached object and will not be updated automatically
        const updatedUser = await this.userService.findByEmail(email);
        await this.emailVerificationService.sendResetPasswordEmail(updatedUser);
        return {
          code: SUCCESS,
          message: 'We have sent you a reset email. Please check your mailbox.',
        };
      }
    } catch (error) {
      return {
        code: RESET_PASSWORD_ERROR,
        message: 'An unexpected error occurred during sending reset password email.',
      };
    }
  }

  async resetPassword(input: ResetPasswordInput): Promise<Result> {
    try {
      const { newPassword, resetToken } = input;

      let decodedToken;
      try {
        decodedToken = this.jwtService.verify(resetToken);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return {
            code: RESET_PASSWORD_ERROR,
            message: 'Token has expired',
          };
        }
        return {
          code: RESET_PASSWORD_ERROR,
          message: 'Invalid reset password token',
        };
      }

      const { email } = decodedToken;

      const user = await this.userService.findByEmail(email);

      if (!user) {
        return {
          code: RESET_PASSWORD_ERROR,
          message: 'User not found',
        };
      }

      if (!user.resetPasswordToken || user.resetPasswordToken !== resetToken) {
        return {
          code: RESET_PASSWORD_ERROR,
          message: 'Invalid reset password token',
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const res = await this.userService.update(user.id, {
        password: hashedPassword,
        resetPasswordToken: null,
      });
      if (res) {
        return {
          code: SUCCESS,
          message: 'Password reset successfully',
        };
      } else {
        return {
          code: RESET_PASSWORD_ERROR,
          message: 'Password reset failed',
        };
      }
    } catch (error) {
      return {
        code: RESET_PASSWORD_ERROR,
        message: 'An unexpected error occurred during password reset.',
      };
    }
  }

  async generateAccessToken(id: string): Promise<string> {
    const foundUser = await this.userService.find(id);
    const refreshToken = foundUser.refreshToken;
    let isRefreshTokenValid: boolean;
    try {
      this.jwtService.verify(refreshToken);
      isRefreshTokenValid = true;
    } catch (error) {
      isRefreshTokenValid = false;
    }
    if (isRefreshTokenValid) {
      let accessToken: string;
      accessToken = this.jwtService.sign({ id: id }, { expiresIn: '1h' });
      await this.userService.update(id, { accessToken });
      return accessToken;
    } else {
      return '';
    }
  }

  async revokeTokens(context: any): Promise<boolean> {
    const req = context.req;
    const { id } = await this.tokenService.processToken(req);
    const updatedUser = await this.userService.update(id, {
      refreshToken: null,
      accessToken: null,
    });
    return !!updatedUser;
  }
}

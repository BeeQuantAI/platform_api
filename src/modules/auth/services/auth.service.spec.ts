import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { EmailVerificationService } from './email.service';
import { User } from '../../user/models/user.entity';
import * as bcrypt from 'bcryptjs';
import {
  ACCOUNT_EXIST,
  ACCOUNT_NOT_VERIFIED,
  ACCOUNT_NOT_EXIST,
  LOGIN_ERROR,
  REGISTER_ERROR,
  SUCCESS,
  UPDATE_PASSWORD_ERROR,
  RESET_PASSWORD_ERROR,
  VERIFY_ERROR,
} from '@/common/constants/code';
import { AccessTokenGuard } from '@/modules/auth/guards/jwt-access-auth.guard';
import { RefreshJwtAuthGuard } from '@/modules/auth/guards/jwt-refresh-auth.guard';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';
import { TokenService } from '@/modules/auth/services/token.service';
import { UserResolver } from '@/modules/user/user.resolver';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let emailVerificationService: EmailVerificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        TokenService,
        UserResolver,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: EmailVerificationService,
          useValue: {
            generateVerificationToken: jest.fn(),
            sendVerificationEmail: jest.fn(),
            sendResetPasswordEmail: jest.fn(),
          },
        },
        CombinedAuthGuard,
        AccessTokenGuard,
        RefreshJwtAuthGuard,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    emailVerificationService = module.get<EmailVerificationService>(EmailVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return error if user does not exist', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(null);
      expect(await service.login('test@example.com', 'password', true)).toEqual({
        code: 10002,
        message: "account doesn't exist",
      });
    });

    it('should return error if password is invalid', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce({
        id: 'a9868b30-51bd-4070-8dbb-043a56e21bcb',
        email: 'wethanw.001@gmail.com',
        password: 'YourSecurePassword',
      } as User);

      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValueOnce(false);

      expect(await service.login('test@example.com', 'wrongpassword', true)).toEqual({
        code: 10003,
        message: 'login failed, wrong password',
      });
    });

    it('should return token if login is successful', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce({
        id: 'a9868b30-51bd-4070-8dbb-043a56e21bcb',
        email: 'wethanw.001@gmail.com',
        password: 'YourSecurePassword',
        isEmailVerified: true,
      } as User);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValueOnce(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      expect(await service.login('test@example.com', 'password', true)).toEqual({
        code: 200,
        message: 'login successful',
        data: 'token',
      });
    });

    it('should login fail if email is not verified', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce({
        id: 'a9868b30-51bd-4070-8dbb-043a56e21bcb',
        email: 'wethanw.001@gmail.com',
        password: 'YourSecurePassword',
      } as User);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValueOnce(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      expect(await service.login('test@example.com', 'password', true)).toEqual({
        code: ACCOUNT_NOT_VERIFIED,
        message: 'Email verification required. A new verification email will be sent shortly.',
      });
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const newUserInput = {
        email: 'test@example.com',
        password: 'password',
        displayName: 'Test User',
        ref: 'Default_Ref_Value',
      };
      (userService.findByEmail as jest.Mock).mockResolvedValueOnce(null);
      (userService.create as jest.Mock).mockResolvedValueOnce({
        id: 1,
        ...newUserInput,
      });

      const result = await service.register(newUserInput);

      expect(result.code).toBe(SUCCESS);
    });

    it('should return ACCOUNT_EXIST error when user already exists', async () => {
      const existingUserInput = {
        email: 'existing@example.com',
        password: 'password',
        displayName: 'Default_Display_Name',
        ref: 'Default_Ref_Value',
      };
      (userService.findByEmail as jest.Mock).mockResolvedValueOnce(existingUserInput);

      const result = await service.register(existingUserInput);

      expect(result.code).toBe(ACCOUNT_EXIST);
    });

    it('should return SUCCESS when displayName is an empty string', async () => {
      const newUserInput = {
        email: 'existing@example.com',
        password: 'password',
        displayName: '',
        ref: 'Default_Ref_Value',
      };
      (userService.findByEmail as jest.Mock).mockResolvedValueOnce(null);
      (userService.create as jest.Mock).mockResolvedValueOnce({
        id: 1,
        ...newUserInput,
      });

      const result = await service.register(newUserInput);

      expect(result.code).toBe(SUCCESS);
    });

    it('should return registration failed error when mandatory fields are missing', async () => {
      const incompleteUserInput = {
        email: '',
        password: 'password',
        displayName: 'Incomplete User',
        ref: 'Default_Ref_Value',
      };
      const expectedErrorMessage = 'registration failed';

      const result = await service.register(incompleteUserInput);

      expect(result.code).toBe(REGISTER_ERROR);
      expect(result.message).toBe(expectedErrorMessage);
    });
  });

  describe('verifyEmail', () => {
    it('should return error if user not found', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      const result = await service.verifyEmail('test@example.com', 'token');

      expect(result).toEqual({ code: VERIFY_ERROR, message: 'User not found' });
    });

    it('should return success if email is already verified', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue({ isEmailVerified: true } as User);

      const result = await service.verifyEmail('test@example.com', 'token');

      expect(result).toEqual({
        code: VERIFY_ERROR,
        message: 'Email is already verified, please login',
      });
    });

    it('should send new verification email if token is expired', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        isEmailVerified: false,
      } as User);
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw { name: 'TokenExpiredError' };
      });
      jest
        .spyOn(emailVerificationService, 'generateVerificationToken')
        .mockReturnValue('new-token');
      jest.spyOn(userService, 'update').mockResolvedValue(true);

      const result = await service.verifyEmail('test@example.com', 'expired-token');

      expect(emailVerificationService.generateVerificationToken).toHaveBeenCalled();
      expect(userService.update).toHaveBeenCalled();
      expect(emailVerificationService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toEqual({
        code: VERIFY_ERROR,
        message: 'Verify link expired',
      });
    });

    it('should verify email successfully', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        isEmailVerified: false,
        verificationToken: 'valid-token',
      } as User);
      jest.spyOn(jwtService, 'verify').mockImplementation(() => ({}));
      jest.spyOn(userService, 'update').mockResolvedValue(true);

      const result = await service.verifyEmail('test@example.com', 'valid-token');

      expect(userService.update).toHaveBeenCalledWith('1', {
        isEmailVerified: true,
        verificationToken: null,
      });
      expect(result).toEqual({ code: 200, message: 'Verification successful, please login' });
    });
  });

  describe('change password', () => {
    const mockContext = {
      req: {
        user: {
          id: 'user-id',
        },
      },
    };

    const updatePasswordInput = {
      oldPassword: 'oldPass123!',
      newPassword: 'newPass123!',
    };

    it('should fail to change password if user does not exist', async () => {
      jest.spyOn(userService, 'find').mockResolvedValue(null);
      const result = await service.changePassword(mockContext, updatePasswordInput);
      expect(result).toEqual({
        code: ACCOUNT_NOT_EXIST,
        message: "account doesn't exist",
      });
    });

    it('should fail if current password is incorrect', async () => {
      jest
        .spyOn(userService, 'find')
        .mockResolvedValue({ id: 'user-id', password: 'hash' } as User);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(false);
      const result = await service.changePassword(mockContext, updatePasswordInput);
      expect(result).toEqual({
        code: LOGIN_ERROR,
        message: 'the current password is incorrect',
      });
    });

    it('should successfully update password', async () => {
      jest
        .spyOn(userService, 'find')
        .mockResolvedValue({ id: 'user-id', password: 'hash' } as User);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash' as any).mockResolvedValue('newHash');
      jest.spyOn(userService, 'update').mockResolvedValue(true);
      const result = await service.changePassword(mockContext, updatePasswordInput);
      expect(result).toEqual({
        code: SUCCESS,
        message: 'password updated',
      });
    });

    it('should report an error if the password update fails', async () => {
      jest
        .spyOn(userService, 'find')
        .mockResolvedValue({ id: 'user-id', password: 'hash' } as User);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash' as any).mockResolvedValue('newHash');
      jest.spyOn(userService, 'update').mockResolvedValue(false);
      const result = await service.changePassword(mockContext, updatePasswordInput);
      expect(result).toEqual({
        code: UPDATE_PASSWORD_ERROR,
        message: 'password update failed',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should return error if user does not exist', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toEqual({
        code: RESET_PASSWORD_ERROR,
        message: "account doesn't exist",
      });
    });

    it('should generate reset token and send email for existing user', async () => {
      const mockUser = { id: '1', email: 'test@example.com' } as User;
      const mockUpdatedUser = { ...mockUser, resetPasswordToken: 'mock-token' } as User;

      jest
        .spyOn(userService, 'findByEmail')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUpdatedUser);
      jest
        .spyOn(emailVerificationService, 'generateVerificationToken')
        .mockReturnValueOnce('mock-token');
      jest.spyOn(userService, 'update').mockResolvedValueOnce(true);
      jest
        .spyOn(emailVerificationService, 'sendResetPasswordEmail')
        .mockResolvedValueOnce(undefined);

      const result = await service.forgotPassword('test@example.com');

      expect(result).toEqual({
        code: SUCCESS,
        message: 'We have sent you a reset email. Please check your mailbox.',
      });
      expect(userService.update).toHaveBeenCalledWith('1', { resetPasswordToken: 'mock-token' });
      expect(emailVerificationService.sendResetPasswordEmail).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should handle unexpected errors', async () => {
      jest.spyOn(userService, 'findByEmail').mockRejectedValueOnce(new Error('Database error'));

      const result = await service.forgotPassword('test@example.com');

      expect(result).toEqual({
        code: RESET_PASSWORD_ERROR,
        message: 'An unexpected error occurred during sending reset password email.',
      });
    });
  });

  describe('resetPassword', () => {
    const mockResetPasswordInput = {
      newPassword: 'newPassword123!',
      resetToken: 'valid-token',
    };

    it('should return error for expired token', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        throw { name: 'TokenExpiredError' };
      });

      const result = await service.resetPassword(mockResetPasswordInput);

      expect(result).toEqual({
        code: RESET_PASSWORD_ERROR,
        message: 'Token has expired',
      });
    });

    it('should return error if resetPasswordToken is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        resetPasswordToken: 'different-token',
      } as User;
      jest.spyOn(jwtService, 'verify').mockReturnValueOnce({ email: 'test@example.com' });
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(mockUser);

      const result = await service.resetPassword(mockResetPasswordInput);

      expect(result).toEqual({
        code: RESET_PASSWORD_ERROR,
        message: 'Invalid reset password token',
      });
    });

    it('should successfully reset password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        resetPasswordToken: 'valid-token',
      } as User;
      jest.spyOn(jwtService, 'verify').mockReturnValueOnce({ email: 'test@example.com' });
      jest.spyOn(userService, 'findByEmail').mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashed-password' as never);
      jest.spyOn(userService, 'update').mockResolvedValueOnce(true);

      const result = await service.resetPassword(mockResetPasswordInput);

      expect(result).toEqual({
        code: SUCCESS,
        message: 'Password reset successfully',
      });
      expect(userService.update).toHaveBeenCalledWith('1', {
        password: 'hashed-password',
        resetPasswordToken: null,
      });
    });

    it('should handle unexpected errors', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        return { email: 'test@example.com' };
      });
      jest.spyOn(userService, 'findByEmail').mockRejectedValueOnce(new Error('Database error'));

      const result = await service.resetPassword(mockResetPasswordInput);

      expect(result).toEqual({
        code: RESET_PASSWORD_ERROR,
        message: 'An unexpected error occurred during password reset.',
      });
    });
  });
});

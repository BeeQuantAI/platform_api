import { ResetPasswordValidationPipe } from './reset-password-validation.pipe';
import { passwordResetSchema } from '@/validation/schemas/auth/password.reset';
import { EmptyFiledException } from '@/exceptions/empty-field.exception';
import { InvalidInputException } from '@/exceptions/invalid-input.exception';
import { PasswordErrorMsgs } from '@/common/utils/helpers';

describe('ResetPasswordValidationPipe', () => {
  let pipe: ResetPasswordValidationPipe;

  beforeEach(() => {
    pipe = new ResetPasswordValidationPipe(passwordResetSchema);
  });

  it('should return value when validation succeeds', () => {
    const value = {
      newPassword: 'ValidPass123!',
      resetToken: 'validToken123',
    };
    expect(pipe.transform(value)).toEqual(value);
  });

  it('should throw EmptyFiledException when newPassword is missing', () => {
    const value = {
      newPassword: '',
      resetToken: 'validToken123',
    };
    expect(() => pipe.transform(value)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(value)).toThrow(PasswordErrorMsgs.Required);
  });

  it('should throw EmptyFiledException when resetToken is missing', () => {
    const value = {
      newPassword: 'ValidPass123!',
      resetToken: '',
    };
    expect(() => pipe.transform(value)).toThrow(EmptyFiledException);
  });

  it('should throw InvalidInputException when newPassword does not match pattern', () => {
    const value = {
      newPassword: 'invalidPass',
      resetToken: 'validToken123',
    };
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(PasswordErrorMsgs.Invalid);
  });

  it('should throw InvalidInputException when newPassword is too short', () => {
    const value = {
      newPassword: 'Short1!',
      resetToken: 'validToken123',
    };
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(PasswordErrorMsgs.MinLength);
  });

  it('should throw InvalidInputException when newPassword is too long', () => {
    const value = {
      newPassword: 'validPaabcedfs01234567890!!abcdefghi0123',
      resetToken: 'validToken123',
    };
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(PasswordErrorMsgs.MaxLength);
  });
});

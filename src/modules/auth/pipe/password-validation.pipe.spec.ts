import { PasswordValidationPipe } from './password-validation.pipe';

describe('PasswordValidationPipe', () => {
  let pipe: PasswordValidationPipe;

  beforeEach(() => {
    pipe = new PasswordValidationPipe();
  });

  it('should transform valid passwords', () => {
    const validPasswords = [
      'Password123!',
      'Test@123',
      'Secure#2022',
      '8Character!'
    ];
    validPasswords.forEach(password => {
      expect(pipe.transform(password)).toBe(password);
    });
  });

  it('should throw exception for invalid passwords', () => {
    const invalidPasswords = [
      'short',
      'longpasswordtoolongtoolongtoolongtoolongtoolong',
      'NoSpecialChar123',
      'NoNumber@!',
      'lowercase@123'
    ];
    invalidPasswords.forEach(password => {
      try {
        pipe.transform(password);
      } catch(error) {
        expect(error.message).toEqual('Validation failed: password must contain 8 to 32 characters, including letter, number and special character.');
        expect(error.getStatus()).toEqual(400);
      }
    });
  });

  it('should throw exception for non-string values', () => {
    const nonStringValues = [
      12345678,
      null,
      undefined,
      true,
      {},
      []
    ];
    nonStringValues.forEach(value => {
      try {
        pipe.transform(value);
      } catch(error) {
        expect(error.message).toEqual('Validation failed: password must be a string');
        expect(error.getStatus()).toEqual(400);
      }
    });
  });
});

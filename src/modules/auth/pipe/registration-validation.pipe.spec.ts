import { InvalidInputException } from './../../../exceptions/invalid-input.exception';
import { ValidationPipe } from './registration-validation.pipe';
import { userSchema } from '../../../validation/schemas/auth/user.request';
import { EmptyFiledException } from '@/exceptions/empty-field.exception';

describe('ValidationPipe', () => {
  let pipe: ValidationPipe;

  const validData = {
    displayName: 'test',
    email: 'test@example.com',
    password: 'password123!',
    ref: 'ADMIN',
  };

  beforeAll(() => {
    pipe = new ValidationPipe(userSchema);
  });

  it('should transform value if validation passes', () => {
    expect(pipe.transform(validData)).toEqual(validData);
  });

  it('should pass when displayName is empty', () => {
    const value = { ...validData, displayName: '' };
    expect(() => pipe.transform(value)).not.toThrow();
  });

  it('should throw EmptyFiledException if email is empty', () => {
    const value = { ...validData, email: '' };
    expect(() => pipe.transform(value)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(value)).toThrow('"email" is required');
  });

  it('should throw EmptyFiledException if password is empty', () => {
    const value = { ...validData, password: '' };
    expect(() => pipe.transform(value)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(value)).toThrow('"password" is required');
  });

  it('should throw InvalidInputException with customized error message if email is not valid', () => {
    const value = { ...validData, email: '123' };
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow('"email" must be a valid email');
  });

  it('should throw InvalidInputException with default error message if password is not valid', () => {
    const value = { ...validData, password: 'sh1' };
    try {
      expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    } catch (e) {
      const message = e.message;
      expect(() => pipe.transform(value)).toThrow(message);
    }
  });

  it('should throw InvalidInputException with default error message if displayName is not valid', () => {
    const value = { ...validData, displayName: '22' };
    try {
      expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    } catch (e) {
      const message = e.message;
      expect(() => pipe.transform(value)).toThrow(message);
    }
  });
});

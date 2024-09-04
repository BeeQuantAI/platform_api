import { EmailValidationPipe } from './email-validation.pipe';
import { emailSchema } from '@/common/utils/helpers';
import { EmptyFiledException } from '@/exceptions/empty-field.exception';
import { InvalidInputException } from '@/exceptions/invalid-input.exception';
import { EmailErrorMsgs } from '@/common/utils/helpers';

describe('EmailValidationPipe', () => {
  let pipe: EmailValidationPipe;

  beforeEach(() => {
    pipe = new EmailValidationPipe(emailSchema);
  });

  it('should return value when validation succeeds', () => {
    const value = 'valid.email@example.com';
    expect(pipe.transform(value)).toEqual(value);
  });

  it('should throw EmptyFiledException when email is missing', () => {
    const value = '';
    expect(() => pipe.transform(value)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(value)).toThrow(EmailErrorMsgs.Required);
  });

  it('should throw InvalidInputException for missing "@" symbol', () => {
    const value = 'invalidemail.com';
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(EmailErrorMsgs.Invalid);
  });

  it('should throw InvalidInputException for invalid characters', () => {
    const value = 'user!@example.com';
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(EmailErrorMsgs.Invalid);
  });

  it('should throw InvalidInputException for missing top-level domain', () => {
    const value = 'user@example';
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(EmailErrorMsgs.Invalid);
  });

  it('should throw InvalidInputException for missing domain part', () => {
    const value = 'user@';
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(EmailErrorMsgs.Invalid);
  });

  it('should throw InvalidInputException for missing username part', () => {
    const value = '@example.com';
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(EmailErrorMsgs.Invalid);
  });
});

import { exchangeKeyCreateSchema } from '@/validation/schemas/exchangeKey/exchangeKey.create';
import { ExchangeKeyValidationPipe } from './exchangeKey-validation.pipe';
import { EmptyFiledException } from '@/exceptions/empty-field.exception';
import { DisplayErrorMsgs, ExchangeKeyErrorMsgs } from '@/common/utils/helpers';
import { InvalidInputException } from '@/exceptions/invalid-input.exception';

describe('ExchangeKeyValidationPipe', () => {
  let pipe: ExchangeKeyValidationPipe;

  const validData = {
    displayName: 'test',
    exchangeName: 'binance',
    accessKey: 'accessKey',
    secretKey: 'secretKey',
  };
  beforeAll(() => {
    pipe = new ExchangeKeyValidationPipe(exchangeKeyCreateSchema);
  });

  it('should transform value if validation passes', () => {
    expect(pipe.transform(validData)).toEqual(validData);
  });

  it('should throw EmptyFiledException if displayName is empty', () => {
    const value = { ...validData, displayName: '' };
    expect(() => pipe.transform(value)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(value)).toThrow(DisplayErrorMsgs.Required);
  });

  it('should throw EmptyFiledException if exchangeName is empty', () => {
    const value = { ...validData, exchangeName: '' };
    expect(() => pipe.transform(value)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(value)).toThrow(ExchangeKeyErrorMsgs.ExchangeNameRequired);
  });

  it('should throw EmptyFiledException if accessKey is empty', () => {
    const value = { ...validData, accessKey: '' };
    expect(() => pipe.transform(value)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(value)).toThrow(ExchangeKeyErrorMsgs.AccessKeyRequired);
  });

  it('should throw EmptyFiledException if secretKey is empty', () => {
    const value = { ...validData, secretKey: '' };
    expect(() => pipe.transform(value)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(value)).toThrow(ExchangeKeyErrorMsgs.SecretKeyRequired);
  });

  it('should throw InvalidInputException with minLength error message if displayName is too short', () => {
    const value = { ...validData, displayName: 'ab' };
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(DisplayErrorMsgs.MinLength);
  });

  it('should throw InvalidInputException with maxLength error message if displayName is too long', () => {
    const value = {
      ...validData,
      displayName: 'BinanceExchangeOneXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    };
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(DisplayErrorMsgs.MaxLength);
  });

  it('should throw InvalidInputException if displayName is invalid', () => {
    const value = { ...validData, displayName: '@binance' };
    expect(() => pipe.transform(value)).toThrow(InvalidInputException);
    expect(() => pipe.transform(value)).toThrow(DisplayErrorMsgs.Invalid);
  });
});

import { uiKlineQuerySchema } from '@/validation/schemas/binance-data/uiKline.query';
import { BinanceDateValidationPipe } from './binance-data-validation.pipe';
import { EmptyFiledException } from '@/exceptions/empty-field.exception';
import { UiKlineQueryErrorMsgs } from '@/common/utils/helpers';
import { InvalidInputException } from '@/exceptions/invalid-input.exception';

describe('binanceDataValidationPipe', () => {
  let pipe: BinanceDateValidationPipe;

  const validateData = {
    symbol: 'BTCUSDT',
    interval: '1m',
    startTime: '2024-09-15T00:00:00.000Z',
    endTime: '2024-09-30T00:00:00.000Z',
    limit: 10,
    timeZone: 'UTC',
  };
  beforeAll(() => {
    pipe = new BinanceDateValidationPipe(uiKlineQuerySchema);
  });

  it('should transform value if validation passes', () => {
    expect(pipe.transform(validateData)).toEqual(validateData);
  });

  it('should throw EmptyFiledException if symbol is empty', () => {
    const testData = { ...validateData, symbol: '' };
    expect(() => pipe.transform(testData)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(testData)).toThrow(UiKlineQueryErrorMsgs.SymbolRequired);
  });

  it('should throw InvalidInputException if interval is invalid', () => {
    const testData = { ...validateData, interval: '10D' };
    expect(() => pipe.transform(testData)).toThrow(InvalidInputException);
    expect(() => pipe.transform(testData)).toThrow(UiKlineQueryErrorMsgs.IntervalInvalid);
  });

  it('should throw InvalidInputException if startTime is invalid', () => {
    const testData = { ...validateData, startTime: '2024-09-15' };
    expect(() => pipe.transform(testData)).toThrow(InvalidInputException);
    expect(() => pipe.transform(testData)).toThrow(UiKlineQueryErrorMsgs.TimeInvalid);
  });

  it('should throw InvalidInputException if endTime is invalid', () => {
    const testData = { ...validateData, endTime: '2024-09-15' };
    expect(() => pipe.transform(testData)).toThrow(InvalidInputException);
    expect(() => pipe.transform(testData)).toThrow(UiKlineQueryErrorMsgs.TimeInvalid);
  });

  it('should throw EmptyFieldException if limit is less than 1', () => {
    const testData = { ...validateData, limit: 0 };
    expect(() => pipe.transform(testData)).toThrow(EmptyFiledException);
    expect(() => pipe.transform(testData)).toThrow(UiKlineQueryErrorMsgs.LimitMinLength);
  });

  it('should throw InvalidInputException if limit is greater than 1000', () => {
    const testData = { ...validateData, limit: 1001 };
    expect(() => pipe.transform(testData)).toThrow(InvalidInputException);
    expect(() => pipe.transform(testData)).toThrow(UiKlineQueryErrorMsgs.LimitMaxLength);
  });
});

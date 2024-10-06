import { exchangeKeyCreateSchema } from './exchangeKey.create';

describe('exchangeKeyCreateSchema', () => {
  const validateExchangeKeyInput = {
    displayName: 'test',
    exchangeName: 'binance',
    accessKey: 'accessKey',
    secretKey: 'secretKey',
  };

  it('should fail when displayName is empty', () => {
    const testInput = { ...validateExchangeKeyInput, displayName: '' };
    const result = exchangeKeyCreateSchema.safeParse(testInput);
    expect(result.success).toBe(false);
  });

  it('should fail when exchangeName is less than 4 characters', () => {
    const testInput = { ...validateExchangeKeyInput, displayName: 'bin' };
    const result = exchangeKeyCreateSchema.safeParse(testInput);
    expect(result.success).toBe(false);
  });

  it('should fail when exchangeName is more than 64 characters', () => {
    const testInput = {
      ...validateExchangeKeyInput,
      displayName: 'BinanceExchangeOneXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    };
    const result = exchangeKeyCreateSchema.safeParse(testInput);
    expect(result.success).toBe(false);
  });

  it('should fail when exchangeName contains invalid characters', () => {
    const testInput = { ...validateExchangeKeyInput, displayName: 'binance@' };
    const result = exchangeKeyCreateSchema.safeParse(testInput);
    expect(result.success).toBe(false);
  });

  it('should fail when exchangeName is empty', () => {
    const testInput = { ...validateExchangeKeyInput, exchangeName: '' };
    const result = exchangeKeyCreateSchema.safeParse(testInput);
    expect(result.success).toBe(false);
  });

  it('should fail when accessKey is empty', () => {
    const testInput = { ...validateExchangeKeyInput, accessKey: '' };
    const result = exchangeKeyCreateSchema.safeParse(testInput);
    expect(result.success).toBe(false);
  });

  it('should fail when secretKey is empty', () => {
    const testInput = { ...validateExchangeKeyInput, secretKey: '' };
    const result = exchangeKeyCreateSchema.safeParse(testInput);
    expect(result.success).toBe(false);
  });

  it('should pass when all fields are valid', () => {
    const result = exchangeKeyCreateSchema.safeParse(validateExchangeKeyInput);
    expect(result.success).toBe(true);
  });
});

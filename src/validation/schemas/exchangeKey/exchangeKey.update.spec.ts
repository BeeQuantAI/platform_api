import { exchangeKeyUpdateSchema } from './exchangeKey.update';

describe('exchangeKeyUpdateSchema', () => {
  const validateExchangeKeyInput = {
    id: 'e13ce800-51f7-4a67-9f93-7ccc401cd855',
    displayName: 'test',
    exchangeName: 'binance',
    accessKey: 'accessKey',
    secretKey: 'secretKey',
  };

  it('should fail when id is empty', () => {
    const testInput = { ...validateExchangeKeyInput, id: '' };
    const result = exchangeKeyUpdateSchema.safeParse(testInput);
    expect(result.success).toBe(false);
  });

  it('should fail when id is not valid uuid', () => {
    const testInput = { ...validateExchangeKeyInput, id: 'invalid-uuid' };
    const result = exchangeKeyUpdateSchema.safeParse(testInput);
    expect(result.success).toBe(false);
  });
});

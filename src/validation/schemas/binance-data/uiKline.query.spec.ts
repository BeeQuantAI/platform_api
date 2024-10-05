import { uiKlineQuerySchema } from './uiKline.query';

describe('uiKlineQuerySchema', () => {
  const validateQueryInput = {
    symbol: 'BTCUSDT',
    interval: '1m',
    startTime: '2024-09-15T00:00:00.000Z',
    endTime: '2024-09-30T00:00:00.000Z',
    limit: 10,
    timeZone: 'UTC',
  };
  it('should fail when symbol is empty', () => {
    const textQuery = { ...validateQueryInput, symbol: '' };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(false);
  });

  it('should fail when interval is empty', () => {
    const textQuery = { ...validateQueryInput, interval: '' };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(false);
  });

  it('should fail when interval is invalid', () => {
    const textQuery = { ...validateQueryInput, interval: '10d' };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(false);
  });

  it('should pass when startTime is empty', () => {
    const textQuery = { ...validateQueryInput, startTime: '' };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(true);
  });

  it('should pass when endTime is empty', () => {
    const textQuery = { ...validateQueryInput, endTime: '' };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(true);
  });

  it('should fail when startTime is invalid', () => {
    const textQuery = { ...validateQueryInput, startTime: '9.15' };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(false);
  });

  it('should fail when endTime is invalid', () => {
    const textQuery = { ...validateQueryInput, endTime: '9.30' };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(false);
  });

  it('should pass when limit is empty', () => {
    const textQuery = { ...validateQueryInput, limit: '' };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(true);
  });

  it('should fail when limit is less than 1', () => {
    const textQuery = { ...validateQueryInput, limit: 0 };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(false);
  });

  it('should fail when limit is more than 1000', () => {
    const textQuery = { ...validateQueryInput, limit: 1001 };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(false);
  });

  it('should pass when timeZone is empty', () => {
    const textQuery = { ...validateQueryInput, timeZone: '' };
    const result = uiKlineQuerySchema.safeParse(textQuery);
    expect(result.success).toBe(true);
  });

  it('should pass when all fields are valid', () => {
    const result = uiKlineQuerySchema.safeParse(validateQueryInput);
    expect(result.success).toBe(true);
  });
});

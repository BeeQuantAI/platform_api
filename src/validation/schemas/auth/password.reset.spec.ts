import { passwordResetSchema } from './password.reset';

describe('passwordResetSchema', () => {
  const validData = {
    newPassword: 'ValidPass123!',
    resetToken: 'validToken123',
  };

  it('should validate correctly with valid data', () => {
    const result = passwordResetSchema.safeParse(validData);
    expect(result.success).toEqual(true);
  });

  it('should fail validation when newPassword is empty', () => {
    const data = { ...validData, newPassword: '' };
    const result = passwordResetSchema.safeParse(data);
    expect(result.success).toEqual(false);
  });

  it('should fail validation when resetToken is empty', () => {
    const data = { ...validData, resetToken: '' };
    const result = passwordResetSchema.safeParse(data);
    expect(result.success).toEqual(false);
  });

  it('should fail validation when newPassword does not match pattern', () => {
    const data = { ...validData, newPassword: 'invalidPass' };
    const result = passwordResetSchema.safeParse(data);
    expect(result.success).toEqual(false);
  });

  it('should fail validation when newPassword is too short', () => {
    const data = { ...validData, newPassword: 'Short1!' };
    const result = passwordResetSchema.safeParse(data);
    expect(result.success).toEqual(false);
  });

  it('should fail validation when newPassword is too long', () => {
    const data = { ...validData, newPassword: 'validPaabcedfs01234567890!!abcdefghi0123' };
    const result = passwordResetSchema.safeParse(data);
    expect(result.success).toEqual(false);
  });
});

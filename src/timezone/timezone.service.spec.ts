import { Test, TestingModule } from '@nestjs/testing';
import { TimezoneService } from './timezone.service';
import { UserService } from '../modules/user/user.service';

describe('TimezoneService', () => {
  let service: TimezoneService;
  let userService: UserService;

  const mockUserService = {
    find: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimezoneService,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<TimezoneService>(TimezoneService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTimezones', () => {
    it('should return a list of all timezones', () => {
      const result = service.getAllTimezones();
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('displayName');
    });
  });

  describe('countAllTimezones', () => {
    it('should return the count of all timezones', () => {
      const result = service.countAllTimezones();
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('getMajorTimezones', () => {
    it('should return a list of major timezones', () => {
      const result = service.getMajorTimezones();
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('displayName');
    });
  });

  describe('isValidTimezone', () => {
    it('should validate timezone correctly', () => {
      const validTimezone = 'America/New_York';
      const invalidTimezone = 'Invalid/Timezone';
      expect(service.isValidTimezone(validTimezone)).toBe(true);
      expect(service.isValidTimezone(invalidTimezone)).toBe(false);
    });
  });

  describe('updateUserTimezone', () => {
    it('should return success if user and timezone are valid', async () => {
      const userId = 'some-uuid';
      const timezone = 'America/New_York';
      mockUserService.find.mockResolvedValue({ id: userId });
      mockUserService.update.mockResolvedValue(true);

      const result = await service.updateUserTimezone(userId, timezone);
      expect(result).toEqual({ success: true, message: 'Timezone updated successfully.' });
    });

    it('should return failure if user is not found', async () => {
      const userId = 'some-uuid';
      const timezone = 'America/New_York';
      mockUserService.find.mockResolvedValue(null);

      const result = await service.updateUserTimezone(userId, timezone);
      expect(result).toEqual({ success: false, message: 'User not found.' });
    });

    it('should return failure if timezone is invalid', async () => {
      const userId = 'some-uuid';
      const timezone = 'Invalid/Timezone';
      mockUserService.find.mockResolvedValue({ id: userId });

      const result = await service.updateUserTimezone(userId, timezone);
      expect(result).toEqual({ success: false, message: 'Invalid timezone.' });
    });

    it('should return failure if update fails', async () => {
      const userId = 'some-uuid';
      const timezone = 'America/New_York';
      mockUserService.find.mockResolvedValue({ id: userId });
      mockUserService.update.mockResolvedValue(false);

      const result = await service.updateUserTimezone(userId, timezone);
      expect(result).toEqual({ success: false, message: 'Failed to update timezone.' });
    });
  });
});

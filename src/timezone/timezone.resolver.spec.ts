import { Test, TestingModule } from '@nestjs/testing';
import { TimezoneResolver } from './timezone.resolver';
import { TimezoneService } from './timezone.service';
import { UnauthorizedException } from '@nestjs/common';

describe('TimezoneResolver', () => {
  let resolver: TimezoneResolver;
  let timezoneService: TimezoneService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimezoneResolver,
        {
          provide: TimezoneService,
          useValue: {
            getAllTimezones: jest.fn().mockReturnValue([
              { id: 'UTC', displayName: 'Coordinated Universal Time (UTC)' },
              { id: 'GMT', displayName: 'Greenwich Mean Time (GMT)' },
              { id: 'Asia/Shanghai', displayName: 'China Standard Time (CST)' }
            ]),
            getMajorTimezones: jest.fn().mockReturnValue([
              { id: 'UTC', displayName: 'Coordinated Universal Time (UTC)' }
            ]),
            updateUserTimezone: jest.fn().mockResolvedValue({
              success: true,
              message: 'Timezone updated successfully.',
            }),
          },
        },
      ],
    }).compile();

    resolver = module.get<TimezoneResolver>(TimezoneResolver);
    timezoneService = module.get<TimezoneService>(TimezoneService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(timezoneService).toBeDefined();
  });

  describe('getTimezones', () => {
    it('should return a list of all available timezones', () => {
      const result = resolver.getTimezones();
      expect(result).toEqual(['Coordinated Universal Time (UTC)', 'Greenwich Mean Time (GMT)', 'China Standard Time (CST)']);
      expect(timezoneService.getAllTimezones).toHaveBeenCalled();
    });
  });

  describe('getMajorTimezones', () => {
    it('should return a list of major timezones', () => {
      const result = resolver.getMajorTimezones();
      expect(result).toEqual(['Coordinated Universal Time (UTC)']);
      expect(timezoneService.getMajorTimezones).toHaveBeenCalled();
    });
  });

  describe('updateTimezone', () => {
    it('should return a successful update message', async () => {
      const userId = 'some-uuid';
      const timezone = 'Asia/Tokyo';
      const req = { user: { id: userId }, headers: { authorization: 'Bearer some-valid-jwt-token' } };
      const context = { req };

      const result = await resolver.updateTimezone(userId, timezone, context);
      expect(result).toEqual({
        success: true,
        message: 'Timezone updated successfully.',
      });
      expect(timezoneService.updateUserTimezone).toHaveBeenCalledWith(userId, timezone);
    });

    it('should throw an UnauthorizedException if user ids do not match', async () => {
      const userId = 'some-uuid';
      const timezone = 'Asia/Tokyo';
      const req = { user: { id: 'different-uuid' }, headers: { authorization: 'Bearer some-valid-jwt-token' } };
      const context = { req };

      await expect(resolver.updateTimezone(userId, timezone, context)).rejects.toThrow(UnauthorizedException);
    });
  });
});

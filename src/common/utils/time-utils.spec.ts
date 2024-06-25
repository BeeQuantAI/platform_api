import { majorTimezones,convertToUTC, convertToLocalTime,getFilteredMajorTimezones } from './time-utils';
import * as moment from 'moment-timezone';

describe('time-utils', () => {
  it('should convert local time to UTC correctly', () => {
    // Use moment to create a local time with an explicit time zone
    const localTime = moment.tz('2023-05-01T12:00:00', 'America/New_York').toDate();
    const timezone = 'America/New_York';
    const expected = '2023-05-01T16:00:00.000Z';  // New York Daylight Time, UTC-4

    const result = convertToUTC(localTime, timezone);

    expect(result.toISOString()).toEqual(expected);
  });

  it('should convert UTC time to local time correctly', () => {
    const utcTime = new Date('2023-05-01T16:00:00Z');
    const timezone = 'America/New_York';
    const expected = moment.tz('2023-05-01T12:00:00', 'America/New_York').toISOString();
    const result = convertToLocalTime(utcTime, timezone);
    expect(result.toISOString()).toEqual(expected);
  });
  it('should filter major timezones correctly', () => {
    const filteredTimezones = getFilteredMajorTimezones();
    expect(filteredTimezones.length).toBeLessThanOrEqual(majorTimezones.length);
    filteredTimezones.forEach(timezone => {
      expect(majorTimezones).toContain(timezone);
    });
  });
});


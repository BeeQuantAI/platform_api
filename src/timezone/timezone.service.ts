import * as moment from 'moment-timezone';
import { Injectable } from '@nestjs/common';
import { UserService } from '../modules/user/user.service';
import { ITimezone } from '../common/interfaces/timezone.interface';
import { majorTimezones } from '../common/utils/time-utils';

@Injectable()
export class TimezoneService {
  constructor(
    private readonly userService: UserService
  ) {}

  getAllTimezones(): ITimezone[] {
    return moment.tz.names().map(name => ({
      id: name,
      displayName: `${name} (${moment.tz(name).format('Z z')})`
    }));
  }

  countAllTimezones(): number {
    return moment.tz.names().length;
  }

  getMajorTimezones(): ITimezone[] {
    return majorTimezones
      .filter(timezone => moment.tz.names().includes(timezone))
      .map(timezone => ({
        id: timezone,
        displayName: `${timezone} (${moment.tz(timezone).format('Z z')})`
      }));
  }

  isValidTimezone(timezone: string): boolean {
    return moment.tz.names().includes(timezone);
  }

  async updateUserTimezone(userId: string, timezone: string): Promise<any> {
    // Check if the user exists
    const existingUser = await this.userService.find(userId);
    if (!existingUser) {
      return { success: false, message: 'User not found.' };
    }

    // Validate timezone
    if (!this.isValidTimezone(timezone)) {
      return { success: false, message: 'Invalid timezone.' };
    }

    // Update the user's timezone
    const updated = await this.userService.update(userId, { timezone });
    if (!updated) {
      return { success: false, message: 'Failed to update timezone.' };
    }

    return { success: true, message: 'Timezone updated successfully.' };
  }
}

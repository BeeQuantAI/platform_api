import {
  intervalSchema,
  limitSchema,
  symbolSchema,
  timeSchema,
  timeZoneSchema,
} from '@/common/utils/helpers';
import * as z from 'zod';

export const uiKlineQuerySchema = z.object({
  symbol: symbolSchema,
  interval: intervalSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  limit: limitSchema,
  timeZone: timeZoneSchema,
});

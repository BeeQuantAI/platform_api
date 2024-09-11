import {
  accessKeySchema,
  exchangeKeyDisplayNameSchema,
  exchangeNameSchema,
  secretKeySchema,
} from '@/common/utils/helpers';
import * as z from 'zod';

export const exchangeKeyCreateSchema = z.object({
  displayName: exchangeKeyDisplayNameSchema,
  exchangeName: exchangeNameSchema,
  accessKey: accessKeySchema,
  secretKey: secretKeySchema,
});

import { ExchangeKeyErrorMsgs } from '@/common/utils/helpers';
import { exchangeKeyCreateSchema } from './exchangeKey.create';
import * as z from 'zod';

export const exchangeKeyIdSchema = z
  .string()
  .min(1, { message: ExchangeKeyErrorMsgs.IdRequired })
  .uuid({ message: ExchangeKeyErrorMsgs.IdInvalid });

export const exchangeKeyUpdateSchema = exchangeKeyCreateSchema.extend({
  id: exchangeKeyIdSchema,
});

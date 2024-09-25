import { passwordSchema } from '@/common/utils/helpers';
import * as z from 'zod';

export const passwordResetSchema = z.object({
  newPassword: passwordSchema,
  resetToken: z.string().min(1),
});

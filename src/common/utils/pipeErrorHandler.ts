import { z, ZodIssue } from 'zod';
import { errorMatcher } from './errorMatcher';

export function pipeErrorHandler(error: any) {
  const issues: ZodIssue = error.issues;
  const code: z.ZodIssueCode = issues[0].code;
  const message: string = issues[0].message;
  if (code === 'too_small') {
    const min: number = issues[0].minimum;
    return errorMatcher({ code, message, min });
  }
  return errorMatcher({ code, message });
}

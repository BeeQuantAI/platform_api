import * as z from 'zod';
import * as dotenv from 'dotenv';
dotenv.config();

// Error messages
export enum DisplayErrorMsgs {
  Required = 'Display name is required',
  MinLength = 'Display name must be at least 4 characters',
  MaxLength = 'Display name must be at most 15 characters',
  Invalid = 'Display name must contain only letters, numbers, hyphens and underscores',
}

export enum EmailErrorMsgs {
  Required = 'Email is required',
  Invalid = 'Invalid email address',
}

export enum PasswordErrorMsgs {
  Required = 'Password is required',
  MinLength = 'Password must be at least 8 characters',
  MaxLength = 'Password must be at most 32 characters',
  Invalid = 'Password must contain at least one letter, one number and one special character',
}

export enum RefErrorMsgs {
  Required = 'Referral code is required',
}

export enum PasswordCompareErrorMsgs {
  NotMatch = 'Passwords do not match',
}

export enum PasswordUpdateErrorMsgs {
  OldPasswordRequired = 'Old password is required',
  NewPasswordRequired = 'New password is required',
}

export enum ExchangeKeyErrorMsgs {
  IdRequired = 'Id is required',
  IdInvalid = 'Invalid id',
  ExchangeNameRequired = 'Exchange name is required',
  AccessKeyRequired = 'Access key is required',
  SecretKeyRequired = 'Secret key is required',
}

export enum UiKlineQueryErrorMsgs {
  SymbolRequired = 'Symbol is required',
  IntervalInvalid = 'Interval is not supported or provided',
  TimeInvalid = 'Invalid time format, it should be the date time string format ',
  LimitMinLength = 'Limit must be at least 1',
  LimitMaxLength = 'Limit must be at most 1000',
}

const commonDisplayNameSchema = z
  .string()
  .min(4, { message: DisplayErrorMsgs.MinLength })
  .max(15, { message: DisplayErrorMsgs.MaxLength })
  .regex(/^[a-zA-Z0-9-_]+$/, {
    message: DisplayErrorMsgs.Invalid,
  });

export const displayNameSchema = z.union([
  commonDisplayNameSchema,
  z
    .string()
    .length(0)
    .transform(() => process.env.DEFAULT_DISPLAY_NAME || 'New User'),
]);

const commonPasswordSchema = z
  .string()
  .min(8, { message: PasswordErrorMsgs.MinLength })
  .max(32, { message: PasswordErrorMsgs.MaxLength })
  .regex(
    /^(?=.*[A-Za-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*_+=\\~<>:;”’(),./[\]_`|{}-])[A-Za-z0-9#?!@$%^&*_+=\\~<>:;”’(),./[\]_`|{}-]+$/,
    { message: PasswordErrorMsgs.Invalid }
  );

export const passwordSchema = z
  .string()
  .min(1, { message: PasswordErrorMsgs.Required })
  .and(commonPasswordSchema);

export const newPasswordSchema = z
  .string()
  .min(1, { message: PasswordUpdateErrorMsgs.NewPasswordRequired })
  .and(commonPasswordSchema);

export const oldPasswordSchema = z
  .string()
  .min(1, { message: PasswordUpdateErrorMsgs.OldPasswordRequired })
  .and(commonPasswordSchema);

export const emailSchema = z
  .string()
  .min(1, { message: EmailErrorMsgs.Required })
  .email({ message: EmailErrorMsgs.Invalid });

export const refSchema = z
  .string()
  .optional()
  .default(process.env.DEFAULT_REFERENCE || 'Default_Reference_Name');

export const accessKeySchema = z
  .string()
  .min(1, { message: ExchangeKeyErrorMsgs.AccessKeyRequired });

export const secretKeySchema = z
  .string()
  .min(1, { message: ExchangeKeyErrorMsgs.SecretKeyRequired });

export const exchangeNameSchema = z
  .string()
  .min(1, { message: ExchangeKeyErrorMsgs.ExchangeNameRequired });

export const exchangeKeyDisplayNameSchema = z.intersection(
  z.string().min(1, { message: DisplayErrorMsgs.Required }),
  commonDisplayNameSchema
);

export const symbolSchema = z.string().min(1, { message: UiKlineQueryErrorMsgs.SymbolRequired });

export const intervalSchema = z.enum(
  [
    '1s',
    '1m',
    '3m',
    '5m',
    '15m',
    '30m',
    '1h',
    '2h',
    '4h',
    '6h',
    '8h',
    '12h',
    '1d',
    '3d',
    '1w',
    '1M',
  ],
  { message: UiKlineQueryErrorMsgs.IntervalInvalid }
);

export const timeSchema = z.union([
  z.string().datetime({ message: UiKlineQueryErrorMsgs.TimeInvalid }),
  z.string().length(0),
]);

export const limitSchema = z.union([
  z
    .number()
    .int()
    .min(1, { message: UiKlineQueryErrorMsgs.LimitMinLength })
    .max(1000, { message: UiKlineQueryErrorMsgs.LimitMaxLength }),
  z.string().length(0),
]);

export const timeZoneSchema = z.string().optional();

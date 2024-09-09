import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
  @Field({ description: 'New Password' })
  newPassword: string;

  @Field({ description: 'Reset Token' })
  resetToken: string;
}

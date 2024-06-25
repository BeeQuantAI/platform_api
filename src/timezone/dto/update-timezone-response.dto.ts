import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UpdateTimezoneResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

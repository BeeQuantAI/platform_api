import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ThirdPartyLoginUserInput {
  @Field({ description: 'User ID', nullable: true })
  id?: string;
  @Field({ description: 'Login email' })
  email: string;
  @Field({ description: 'User first name' })
  firstName: string;
  @Field({ description: 'User last name' })
  lastName: string;
  @Field({ description: 'User profile picture', nullable: true })
  picture?: string;
  @Field({ description: 'Access Token', nullable: true })
  accessToken?: string;
  @Field({ description: 'Token Type', nullable: true })
  tokenType?: string;
  @Field({ description: 'ID Token', nullable: true })
  idToken?: string;
  @Field({ description: 'Refresh Token', nullable: true })
  refreshToken?: string;
  @Field({ description: 'Token expiry date', nullable: true })
  expiryDate?: number;
}

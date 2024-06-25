import { Module } from '@nestjs/common';
import { TimezoneService } from './timezone.service';
import { AuthModule } from '../modules/auth/auth.module'; 
import { TimezoneResolver } from './timezone.resolver';
import { UserModule } from '../modules/user/user.module';

@Module({
  imports: [AuthModule, UserModule], 
  providers: [TimezoneService, TimezoneResolver],
  exports: [TimezoneService]
})
export class TimezoneModule {}

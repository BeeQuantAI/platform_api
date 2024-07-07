import { Module, ConsoleLogger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // 导入 JwtModule
import { User } from './models/user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({ 
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: 60 * 60 * 24 + 's',
      },
    }),
  ],
  providers: [ConsoleLogger, UserService, UserResolver, AuthService],
  exports: [UserService],
})
export class UserModule {}

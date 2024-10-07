import { Module, ConsoleLogger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { AuthResolver } from './auth.resolver';
import { UserService } from '../user/user.service';
import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
import { User } from '../user/models/user.entity';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { AccessTokenGuard } from '@/modules/auth/guards/jwt-access-auth.guard';
import { RefreshJwtAuthGuard } from '@/modules/auth/guards/jwt-refresh-auth.guard';
import { CombinedAuthGuard } from '@/modules/auth/guards/combined-auth.guard';
import { TokenService } from '@/modules/auth/services/token.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { AuthController } from '@/modules/auth/auth.controller';
import { EmailVerificationService } from './services/email.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: 60 * 60 * 24 + 's',
      },
    }),
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [
    ConsoleLogger,
    AuthService,
    AuthResolver,
    UserService,
    AccessJwtStrategy,
    RefreshJwtStrategy,
    AccessTokenGuard,
    RefreshJwtAuthGuard,
    CombinedAuthGuard,
    TokenService,
    GoogleStrategy,
    FacebookStrategy,
    EmailVerificationService,
  ],
  exports: [
    AuthService,
    AccessTokenGuard,
    RefreshJwtAuthGuard,
    CombinedAuthGuard,
    JwtModule,
    UserService,
    TokenService,
    EmailVerificationService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

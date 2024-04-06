import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/auth.strategy';
import { JwtRefreshStrategy } from './strategy/refresh.strategy';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { Setting } from './entities/setting.entity';
import { UserRepository } from './repositories/user.repository';
import { LoggerService } from 'src/common/logger.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([User, Setting]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('SECRET_KEY') ?? '',
          signOptions: {
            expiresIn: configService.get('ACCESS_TOKEN_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [
    LoggerService,
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    UserRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}

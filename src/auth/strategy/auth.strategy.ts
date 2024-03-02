import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { ValidatationErrorException } from 'src/common/exception/service.exception';

export interface UserToken {
  id: number;
  email: string;
  iat: number;
  exp: number;
  kakao_id: string;
  level: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: UserToken) {
    const token = req.headers['authorization'].split(' ')[1];
    const { isValidate, message, user } = await this.authService.tokenValidate({
      token,
      email: payload.email,
    });

    if (!isValidate) {
      throw ValidatationErrorException(message);
    }

    return { ...payload, token, user };
  }
}

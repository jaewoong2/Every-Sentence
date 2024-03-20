import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserToken } from './strategy/auth.strategy';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginEmailDto } from './dtos/login-email.dto';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { User } from './entities/user.entity';
import { ConfigType } from '@nestjs/config';
import { authConfig } from 'src/config';
import { UpdateUserBodyDto } from './dtos/update-user.dto';
import { Setting } from './entities/setting.entity';
import { EntityNotFoundException } from 'src/common/exception/service.exception';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class AuthService {
  client: SESClient;
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly jwtService: JwtService, // auth.module의 JwtModule로부터 공급 받음
  ) {
    this.client = new SESClient({ region: 'ap-northeast-2' });
  }

  async getUser(userEmail: string) {
    const user = await this.userRepository
      .createQueryBuilder('User')
      .where('User.email = :email', { email: userEmail })
      .getOneOrFail();

    return {
      message: `${userEmail} 정보 조회 입니다`,
      data: user,
    };
  }

  async getUserSetting(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    return user.setting;
  }

  async updateUser({
    level,
    email,
    name,
    phone_number,
    settings,
  }: UpdateUserBodyDto) {
    const user = await this.userRepository.findOneBy({ email });

    await this.userRepository.updateUser({
      email,
      name,
      level,
      phone_number,
      setting: settings,
    });

    return { message: 'Success', data: user };
  }

  async loginByMagiclink(token: string) {
    try {
      const decodedToken = this.jwtService.decode(token);

      if (typeof decodedToken === 'string') throw new UnauthorizedException();

      if (!('email' in decodedToken && 'redirectTo' in decodedToken)) {
        throw new UnauthorizedException('옳지 않은 Token 입니다');
      }

      const { email, redirectTo } = decodedToken;

      const user = await this.userRepository.findOneBy({ email });

      const refreshToken = this.jwtService.sign(
        { email },
        {
          expiresIn: this.config.auth.refreshToken.expiresIn,
        },
      );

      if (user && user.access_token !== token) {
        throw new UnauthorizedException('만료된 토큰 입니다.');
      }

      user.email = email;
      user.access_token = this.jwtService.sign({ email, id: user.id });
      user.refresh_token = refreshToken;

      await this.userRepository.save(user);

      return {
        redirectTo: new URL(redirectTo).href + `?token=${user.access_token}`,
        ...user,
      };
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }

  async sendMagicLink({
    email,
    redirectTo,
    name,
  }: LoginEmailDto): Promise<void> {
    const payload = { email, redirectTo, name };
    const token = this.jwtService.sign(payload);
    const link = `${this.config.auth.redirect}/${token}`;

    const command = new SendEmailCommand({
      Destination: {
        //목적지
        CcAddresses: [],
        ToAddresses: [email], // 받을 사람의 이메일
      },
      Message: {
        Body: {
          // 이메일 본문 내용
          Text: {
            Charset: 'UTF-8',
            Data: `메일이 보내지는지 테스트중입니다.${link}`,
          },
        },
        Subject: {
          // 이메일 제목
          Charset: 'UTF-8',
          Data: '이메일 테스트',
        },
      },
      Source: 'no-reply@prlc.kr', // 보내는 사람의 이메일 - 무조건 Verfied된 identity여야 함
      ReplyToAddresses: [],
    });

    try {
      await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: email,
          access_token: token,
          level: 'normal',
        })
        .orUpdate(['access_token'], ['email'])
        .execute();

      await this.createUserSetting({ email: email });

      await this.client.send(command);
    } catch (err) {
      return err;
    }
  }

  async createUserSetting(user: Partial<User>) {
    if (!user.email) {
      throw EntityNotFoundException('User Email : 정의되지 않았습니다.');
    }

    const findUser = await this.userRepository.findOneBy({ email: user.email });

    const setting = findUser.setting;

    if (!setting) {
      const $user = await this.userRepository.findOne({
        where: { email: user.email },
      });

      await this.settingRepository.insert({
        preferred_category: null,
        preferred_time: null,
        end_time: null,
        user: $user,
      });

      return true;
    }

    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async refresh({ exp, iat, ...payload }: UserToken) {
    const token = {
      access_token: this.jwtService.sign({
        email: payload.email,
        id: payload.id,
      }),
      refresh_token: this.jwtService.sign(
        { email: payload.email },
        {
          expiresIn: this.config.auth.refreshToken.expiresIn, // 리프레시 토큰의 유효 기간
        },
      ),
    };

    await this.userRepository.update(
      { id: payload.id },
      { refresh_token: token.refresh_token, access_token: token.access_token },
    );

    return token;
  }

  async isValidateRefreshToken(payload: UserToken, refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });

    if (user.refresh_token !== refreshToken) {
      throw new UnauthorizedException('옳지 않은 Refresh Token Value');
    }
  }

  async tokenValidate({ email, token }: { email: string; token: string }) {
    if (!email) {
      return { isValidate: false, message: 'Email이 정의되지 않았습니다.' };
    }

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return {
        isValidate: false,
        message: '잘못된 Email 정보 입니다',
      };
    }

    if (token !== user.access_token) {
      return {
        isValidate: false,
        message: '잘못된 JWT Token 입니다. 다시 로그인 해주세요',
      };
    }

    return { isValidate: true, message: '올바른 JWT Token 입니다.', user };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { authConfig } from 'src/config';
import { User } from 'src/auth/entities/user.entity';
import { WebClient } from '@slack/client';
import { ResponseSlackApiUsersLookupByEmail } from 'src/common/types';
import { EntityNotFoundException } from 'src/common/exception/service.exception';

@Injectable()
export class SlackService {
  client: WebClient;
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.client = new WebClient(config.auth.slack.botUserOauthToken, {
      headers: {
        Authroization: `Bearer ${config.auth.slack.botUserOauthToken}`,
      },
    });
  }

  async sendSlackMessage(memberId: string, text: string) {
    const response = await this.client.chat.postMessage({
      text,
      channel: memberId,
    });

    return response;
  }

  async getUserByEmail(email: string) {
    const dbUser = await this.userRepository.findOne({ where: { email } });

    if (!dbUser) {
      throw EntityNotFoundException(`User: with email ${email} not found.`);
    }

    if (dbUser.slackId) {
      return { id: dbUser.slackId };
    }

    const slackUser = await this.client.users.lookupByEmail({
      email,
      token: this.config.auth.slack.botUserOauthToken,
    });

    const user = slackUser.user as ResponseSlackApiUsersLookupByEmail['user'];

    if (!slackUser || !user) {
      throw EntityNotFoundException(`SlackUser with email ${email} not found.`);
    }

    await this.setSlackUserId(email, user.id);

    return user;
  }

  async setSlackUserId(email: string, slackId: string) {
    const dbUser = await this.userRepository.findOne({ where: { email } });

    if (dbUser.slackId) {
      return;
    }

    dbUser.slackId = slackId;

    await this.userRepository.save(dbUser);

    return;
  }
}

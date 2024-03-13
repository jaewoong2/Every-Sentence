import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sentence } from './entities/sentence.entity';
import { MessageLog } from './entities/message-log.entity';
import { Category } from './entities/category.entity';
import { SentenceController } from './sentence.controller';
import { SentenceService } from './sentence.service';
import { User } from 'src/auth/entities/user.entity';
import { EventBridgeService } from 'src/common/eventbridge.service';
import { Setting } from 'src/auth/entities/setting.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { SlackService } from './slack.service';
import { UserRepository } from 'src/auth/repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sentence, MessageLog, Category, User, Setting]),
  ],
  providers: [
    SentenceService,
    EventBridgeService,
    AuthService,
    JwtService,
    SlackService,
    UserRepository,
  ],
  controllers: [SentenceController],
})
export class SentenceModule {}

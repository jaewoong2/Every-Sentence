import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Setting } from 'src/auth/entities/setting.entity';
import { ManageService } from './manage.service';
import { ManangeController } from './manage.controller';
import { SentenceService } from 'src/sentence/sentence.service';
import { Sentence } from 'src/sentence/entities/sentence.entity';
import { MessageLog } from 'src/sentence/entities/message-log.entity';
import { Category } from 'src/sentence/entities/category.entity';
import { SlackService } from 'src/sentence/slack.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sentence, MessageLog, Category, User, Setting]),
  ],
  providers: [SentenceService, ManageService, SlackService],
  controllers: [ManangeController],
})
export class ManageModule {}

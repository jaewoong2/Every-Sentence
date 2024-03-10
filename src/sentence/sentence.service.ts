import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { authConfig } from 'src/config';
import { User } from 'src/auth/entities/user.entity';
import { MessageLog } from './entities/message-log.entity';
import { Sentence } from './entities/sentence.entity';
import OpenAI from 'openai';
import { SlackService } from './slack.service';
import { getKorDate } from 'src/common/util/date';

type GetSentenceOption = {
  limit?: number;
};

@Injectable()
export class SentenceService {
  openai: OpenAI;
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    @Inject(SlackService)
    private slackService: SlackService,
    @InjectRepository(MessageLog)
    private readonly logRepository: Repository<MessageLog>,
    @InjectRepository(Sentence)
    private readonly sentenceRepository: Repository<Sentence>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.auth.openAiAPIKey });
  }

  async send(user: User) {
    const setences = await this.getSentenceNotSended(user, { limit: 3 });

    const slackUserId = await this.slackService.getUserByEmail(user.email);

    await this.slackService.sendSlackMessage(
      slackUserId.id,
      this.formattingWord(setences),
    );

    setences.forEach(async ({ id }) => {
      await this.saveLog(id, user.id);
    });

    return {
      message: `일본어 문장이 ${user.email} 에게 전송 되었습니다.`,
      data: setences,
    };
  }

  formattingWord(sentences: Sentence[]) {
    return (
      `*[${getKorDate()}]* \n\n` +
      sentences
        .map((sentence) => {
          let result = `================================================ \n`;
          result += `[*${sentence.sentence}*] \n`;
          result += ':jp: 일본어 \n';
          result += `*${sentence.sentence} (${sentence.ko_pronunciation} / ${sentence.jp_pronunciation})* \n`;
          result += `:kr: 해석 \n`;
          result += `*${sentence.translation}* \n\n`;
          result += ':books: 예문 \n';
          result += `*${sentence.example} (${sentence.example_jp_pronunciation})* \n`;
          result += `*${sentence.example_roma_pronunciation} / ${sentence.example_ko_pronunciation}* \n`;
          result += `:memo: 설명 \n`;
          result += `*${sentence.explanation}* \n`;
          result += `================================================ \n\n`;

          return result;
        })
        .join('')
    );
  }

  async getSentenceNotSended(
    { id: userId }: User,
    options?: GetSentenceOption,
  ) {
    const sentSentenceIds = await this.logRepository
      .createQueryBuilder('log')
      .select('log.sentenceId')
      .where('log.userId = :userId', { userId: userId })
      .getRawMany();

    const ids = sentSentenceIds.map((log) => log.sentenceId);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['setting'],
      select: ['setting'],
    });

    const userPrefrredCategory = await (await user.setting).preferred_category;

    const newSentences = await this.sentenceRepository
      .createQueryBuilder('sentence')
      .where(ids.length > 0 ? 'sentence.id NOT IN (:...ids)' : '1=1', { ids })
      .andWhere('sentence.categoryId = :userCategoryId', {
        userCategoryId: userPrefrredCategory.id,
      })
      .select('*')
      .limit(options?.limit)
      .getRawMany<Sentence & { categoryId: number }>();

    return newSentences;
  }

  async saveLog(sentenceId: number, userId: number) {
    await this.logRepository.insert({
      user: { id: userId },
      sentence: {
        id: sentenceId,
      },
    });

    return true;
  }
}

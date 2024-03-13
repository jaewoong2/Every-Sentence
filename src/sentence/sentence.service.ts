import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { MessageLog } from './entities/message-log.entity';
import { Sentence } from './entities/sentence.entity';
import { SlackService } from './slack.service';
import { getKorDate } from 'src/common/util/date';
import { UserRepository } from 'src/auth/repositories/user.repository';

type GetSentenceOption = {
  limit?: number;
};

@Injectable()
export class SentenceService {
  constructor(
    private slackService: SlackService,
    @InjectRepository(MessageLog)
    private readonly logRepository: Repository<MessageLog>,
    @InjectRepository(Sentence)
    private readonly sentenceRepository: Repository<Sentence>,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async sendToUser(user: User) {
    const userId = await this.getUserId(user);
    const sentences = await this.getSentenceNotSended(user, { limit: 3 });

    const slackUserId = await this.slackService.getUserByEmail(user.email);

    await this.slackService.sendSlackMessage(
      slackUserId.id,
      this.formattingWord(sentences),
    );

    await this.saveLogs(sentences, userId);

    return {
      message: `일본어 문장이 ${user.email} 에게 전송 되었습니다.`,
      data: sentences,
    };
  }

  private async getUserId(user: User) {
    if (user.id) return user.id;

    const findUser = await this.userRepository.findOneBy({ email: user.email });

    return findUser.id;
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
    const userPreferences = await this.getUserPreferences(userId);

    const newSentences = await this.sentenceRepository
      .createQueryBuilder('sentence')
      .where(ids.length > 0 ? 'sentence.id NOT IN (:...ids)' : '1=1', { ids })
      .andWhere('sentence.categoryId = :userCategoryId', {
        userCategoryId: userPreferences.setting.preferred_category.id,
      })
      .select('*')
      .limit(options?.limit)
      .getRawMany<Sentence & { categoryId: number }>();

    return newSentences;
  }

  private async getUserPreferences(userId: number) {
    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['setting'],
    });

    const userSetting = await user.setting;
    const preferred_category = await userSetting.preferred_category;

    return {
      ...user,
      setting: {
        ...userSetting,
        preferred_category,
      },
    };
  }

  private async saveLogs(sentences: Sentence[], userId: number): Promise<void> {
    const logs = sentences.map((sentence) => ({
      user: { id: userId },
      sentence: { id: sentence.id },
    }));
    await this.logRepository.insert(logs);
  }
}

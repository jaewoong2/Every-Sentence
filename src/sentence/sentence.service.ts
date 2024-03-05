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
import axios from 'axios';
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MessageLog)
    private readonly logRepository: Repository<MessageLog>,
    @InjectRepository(Sentence)
    private readonly sentenceRepository: Repository<Sentence>,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.auth.openAiAPIKey });
  }

  async sendAll() {}

  async send(user: User) {
    const setences = await this.getSentenceNotSended(user.id, { limit: 2 });

    console.log('sentences -> ', setences);

    const slackUserId = await this.slackService.getUserByEmail(user.email);

    console.log('slackUserId -> ', slackUserId);

    const sendSlackMessageResponse = await this.slackService.sendSlackMessage(
      slackUserId.id,
      this.formattingWord(setences),
    );

    console.log('sendSlackMessageResponse -> ', sendSlackMessageResponse);

    return {
      message: `일본어 문장이 ${user.email} 에게 전송 되었습니다.`,
      data: setences,
    };
  }

  formattingWord(sentences: Sentence[]) {
    return sentences
      .map((sentence) => {
        let result = '';

        result += ':jp: 일본어 \n';
        result += `*${sentence.sentence} (${sentence.ko_pronunciation} / ${sentence.jp_pronunciation})* \n`;
        result += `:kr: 해석 \n`;
        result += `*${sentence.translation}* \n`;
        result += ':books: 예문 \n';
        result += `*${sentence.example} (${sentence.example_ko_pronunciation} / ${sentence.example_jp_pronunciation})* \n`;
        result += `:memo: 설명 \n`;
        result += `*${sentence.explanation}* \n\n`;

        return result;
      })
      .join('');
  }

  async getSentenceNotSended(userId: number, options?: GetSentenceOption) {
    const sentSentenceIds = await this.logRepository
      .createQueryBuilder('log')
      .select('log.sentenceId')
      .where('log.userId = :userId', { userId })
      .getRawMany();

    const ids = sentSentenceIds.map((log) => log.sentenceId);

    const newSentences = await this.sentenceRepository
      .createQueryBuilder('sentence')
      .where(ids.length > 0 ? 'sentence.id NOT IN (:...ids)' : '1=1', { ids })
      .select('*')
      .limit(options?.limit)
      .getRawMany<Sentence & { categoryId: number }>();

    return newSentences;
  }

  async update(id: number, newSentence: Partial<Sentence>) {
    await this.sentenceRepository.update(id, newSentence);
  }

  async updateSentence(newSentences: (Sentence & { categoryId: number })[]) {
    const { translate } = this.useOpenAPI('hiragana');

    const result = await Promise.all(
      newSentences.map(({ sentence, id, categoryId }) =>
        translate(sentence, id, categoryId),
      ),
    );

    const contents = result.map((v) => [
      ...v.message.content.split('|'),
      `${v.id}`,
      `${v.categoryId}`,
    ]) as string[][];

    contents.forEach(async (content) => {
      const [kPronunciation, id, categoryId] = content;

      if (categoryId === '2') {
        const newSentence = {
          example_ko_pronunciation: kPronunciation,
        };
        await this.sentenceRepository.update(id, newSentence);
      } else {
        const newSentence = {
          ko_pronunciation: kPronunciation,
        };
        await this.sentenceRepository.update(id, newSentence);
      }
    });
  }

  useOpenAPI(type: 'word' | 'sentence' | 'hiragana') {
    const types = {
      word: `Given a Japanese word, generate details in the following format: [Japanese Word] | [Pronunciation in Hiragana] | [Translate To Korean] | [Example Long Sentence in Japanese] | [Example Sentence Korean Translation]`,
      sentence: `Given a Japanese Sentence, generate details in the following format: [Kanji To Hiragana (Only Use Hiragana)]
      `,
      hiragana: `Given a Japanese Hiragana,
        generate details in the following format: [How To Pronunciate Hiragana Sentence Using Korean]`,
    };

    const translate = async (word: string, id: number, categoryId: number) => {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: types[type],
          },
          {
            role: 'system',
            content:
              '한국어 뜻이 아니라 한국어로 자연스럽게 읽는 방법을 한줄로 한국어로 답변해줘',
          },
          { role: 'user', content: word },
        ],
        model: 'gpt-3.5-turbo',
        temperature: 1,
      });

      return { ...completion.choices[0], id, categoryId };
    };

    return { translate };
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

  async transferToRomaja(sentence: string[]) {
    const result = await axios.post<{
      romanizations: {
        romanizedText: string;
      }[];
    }>(
      `https://translation.googleapis.com/v3/projects/${this.config.auth.google.project_id}:romanizeText`,
      {
        source_language_code: 'ja',
        contents: sentence,
      },
      {
        headers: {
          'x-goog-user-project': this.config.auth.google.project_id,
          Authorization: `Bearer ${this.config.auth.google.access_token_auth}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    );

    return result.data.romanizations.flat().map((roma) => roma.romanizedText);
  }

  async updateRoma(value: string, roma: string) {
    const sentence = await this.sentenceRepository.findOne({
      where: { sentence: value },
    });

    if (!sentence) {
      const sentence = await this.sentenceRepository.findOne({
        where: { example: value },
      });

      sentence.example_roma_pronunciation = roma;

      await this.sentenceRepository.save(sentence);
      return true;
    }

    sentence.roma_pronunciation = roma;

    await this.sentenceRepository.save(sentence);

    return true;
  }
}

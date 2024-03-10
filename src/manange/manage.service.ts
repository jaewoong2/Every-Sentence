import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import OpenAI from 'openai';
import { authConfig } from 'src/config';
import { Sentence } from 'src/sentence/entities/sentence.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ManageService {
  openai: OpenAI;
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
    @InjectRepository(Sentence)
    private readonly sentenceRepository: Repository<Sentence>,
  ) {
    this.openai = new OpenAI({ apiKey: this.config.auth.openAiAPIKey });
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

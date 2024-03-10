import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { ManageService } from './manage.service';
import { SentenceService } from 'src/sentence/sentence.service';

@ApiTags('manange')
@Controller('api/manange')
export class ManangeController {
  constructor(
    private manageService: ManageService,
    private sentenceService: SentenceService,
  ) {}

  @Get('roma')
  @UseGuards(JwtAuthGuard)
  async transferToRoma(@Req() request: Request) {
    const { user } = request;

    const sentences = await this.sentenceService.getSentenceNotSended(
      user.user,
      { limit: 9999999 },
    );

    const newSentences = sentences.map(({ categoryId, sentence, example }) => {
      if (categoryId === 2) {
        return example;
      }

      return sentence;
    });

    const result = await this.manageService.transferToRomaja(newSentences);

    result.forEach(async (roma, index) => {
      const sentence = newSentences[index];
      await this.manageService.updateRoma(sentence, roma);
    });

    return result;
  }
}

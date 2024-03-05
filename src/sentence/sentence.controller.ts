import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SentenceService } from './sentence.service';
import { SendBodyDto } from './dtos/send.dto';
import { EventBridgeService } from 'src/common/eventbridge.service';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { User } from 'src/auth/entities/user.entity';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { user: User };
  }
}

@ApiTags('sentence')
@Controller('api/sentence')
export class SentenceController {
  constructor(
    private sentenceService: SentenceService,
    private eventBridgeService: EventBridgeService,
  ) {}

  @Post('all')
  async sendAll() {
    return await this.sentenceService.sendAll();
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(@Req() request: Request) {
    const { user } = request;

    return await this.eventBridgeService.register(user.user);
  }

  // Register 를 통해 들록된 Target API
  @Post()
  async send(@Body() { user }: SendBodyDto) {
    return await this.sentenceService.send(user);
  }

  @Get('cw')
  @UseGuards(JwtAuthGuard)
  async cw(@Req() request: Request) {
    const { user } = request;

    const sentences = await this.sentenceService.getSentenceNotSended(
      user.user.id,
      { limit: 100000000 },
    );

    const newSentences = sentences.map(({ categoryId, sentence, example }) => {
      if (categoryId === 2) {
        return example;
      }

      return sentence;
    });

    const result = await this.sentenceService.transferToRomaja(newSentences);

    result.forEach(async (roma, index) => {
      const sentence = newSentences[index];
      console.log(sentence, roma);
      await this.sentenceService.updateRoma(sentence, roma);
    });

    return result;
  }
}

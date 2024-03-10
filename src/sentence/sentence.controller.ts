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

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(@Req() request: Request) {
    const { user } = request;

    return await this.eventBridgeService.register(user.user);
  }

  @Post()
  async send(@Body() { user }: SendBodyDto) {
    return await this.sentenceService.send(user);
  }

  // Health Check
  @Get()
  async getSentences(@Body() { user }: SendBodyDto) {
    return await this.sentenceService.getSentenceNotSended(user, { limit: 5 });
  }
}

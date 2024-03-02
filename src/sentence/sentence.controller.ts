import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SentenceService } from './sentence.service';
import { SendQueryDto } from './dtos/send.dto';
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

  @Post()
  async sendAll() {
    return await this.sentenceService.sendAll();
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(@Req() request: Request) {
    const { user } = request;

    return await this.eventBridgeService.register(user.user);
  }

  @Get()
  async send(@Query() query: SendQueryDto) {
    console.log(query);
    return;

    // return await this.sentenceService.send(query.id);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from './guard/roles.guard';
import { LoginEmailDto } from './dtos/login-email.dto';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './guard/refresh.guard';
import { UserToken } from './strategy/auth.strategy';
import { JwtAuthGuard } from './guard/auth.guard';
import { UpdateUserBodyDto } from './dtos/update-user.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('user')
  @ApiResponse({ status: 200, description: 'Return users.' })
  async getUser(@Query('email') email: string) {
    return await this.authService.getUser(email);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Return all users.' })
  findAll() {
    return 'Hello api/auth';
  }

  @Post('update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: '' })
  @SetMetadata('levels', ['admin', 'gold', 'premium', 'normal', null])
  updateUser(@Body() body: UpdateUserBodyDto) {
    return this.authService.updateUser(body);
  }

  @Post('login-email')
  async sendEmail(@Body() { redirectTo, email }: LoginEmailDto) {
    this.authService.sendMagicLink({ redirectTo, email });
    return 'Mail Send';
  }

  @Get('login-email/:token')
  async getToken(
    @Param('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { redirectTo, refresh_token, access_token } =
      await this.authService.loginByMagiclink(token);

    res.header('Authorization', `Bearer ${access_token}`);
    res.cookie('Refresh', `${refresh_token}`);

    return res.redirect(redirectTo);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(
    @Req() { user }: { user: UserToken },
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.refresh(user);

    res.header('Authorization', `Bearer ${token.access_token}`);
    res.cookie('Refresh', `${token.refresh_token}`);
    return token;
  }
}

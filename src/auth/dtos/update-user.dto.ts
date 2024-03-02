import { ApiProperty } from '@nestjs/swagger';
import { Setting } from '../entities/setting.entity';
import { IsOptional } from 'class-validator';

export class UpdateUserBodyDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsOptional()
  phone_number?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsOptional()
  level?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsOptional()
  settings?: Setting;
}

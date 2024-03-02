import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class SendQueryDto {
  @ApiProperty({
    example: '6',
    description: 'User Id',
  })
  @IsNumber()
  @Type(() => Number)
  id: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject } from 'class-validator';
import { User } from 'src/auth/entities/user.entity';

export class SendBodyDto {
  @ApiProperty({
    example: '6',
    description: 'User Id',
  })
  @IsNotEmptyObject({ nullable: false })
  user: User;
}

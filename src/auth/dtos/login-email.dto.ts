import { IsNotEmpty, IsOptional } from 'class-validator';

export class LoginEmailDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  redirectTo: string;

  @IsOptional()
  name: string;
}

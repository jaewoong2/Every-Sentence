import { IsNotEmpty } from 'class-validator';

export class LoginEmailDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  redirectTo: string;
}

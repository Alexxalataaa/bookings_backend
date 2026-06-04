import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Usuario de admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '1234', description: 'Contraseña de admin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password: string;
}

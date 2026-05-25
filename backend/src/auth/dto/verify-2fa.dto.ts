import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class Verify2faDto {
  @ApiProperty({ example: 'a1b2c3d4e5f6...', description: 'Token temporal de la sesión 2FA' })
  @IsString()
  @IsNotEmpty({ message: 'El token temporal es requerido' })
  tempToken: string;

  @ApiProperty({ example: '123456', description: 'Código de verificación de 6 dígitos' })
  @IsString()
  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  @Length(6, 6, { message: 'El código de verificación debe tener exactamente 6 dígitos' })
  code: string;
}

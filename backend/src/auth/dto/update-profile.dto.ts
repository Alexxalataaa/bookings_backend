import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'newadmin', description: 'Nuevo nombre de usuario' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'newpassword123!', description: 'Nueva contraseña' })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).*$/, {
    message: 'La contraseña debe contener al menos un número y al menos un carácter especial',
  })
  password?: string;
}

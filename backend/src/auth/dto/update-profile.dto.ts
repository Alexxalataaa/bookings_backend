import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'newadmin', description: 'Nuevo nombre de usuario' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({ example: 'newpassword123', description: 'Nueva contraseña' })
  @IsString()
  @IsOptional()
  @MinLength(4, { message: 'La contraseña debe tener al menos 4 caracteres' })
  password?: string;
}

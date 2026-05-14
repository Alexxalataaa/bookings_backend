import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Ana Pérez' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'ana.perez@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+34 600 123 456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Mi Negocio S.L.' })
  @IsOptional()
  @IsString()
  business?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateRewardDto {
  @ApiPropertyOptional({ example: 'Corte gratis' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Disponible tras 10 reservas' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsString()
  validUntil?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  pointsRequired?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @ValidateIf((o, v) => v !== null)
  winnerId?: number | null;
}


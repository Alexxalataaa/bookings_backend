import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRewardDto {
  @ApiProperty({ example: 'Corte gratis' })
  @IsString()
  name: string;

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

  @ApiProperty({ example: 1 })
  @IsInt()
  businessId: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  winnerId?: number;
}

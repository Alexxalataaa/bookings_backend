import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from '../payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 'Ana Pérez' })
  @IsString()
  clientName: string;

  @ApiProperty({ example: 'Mi Negocio S.L.' })
  @IsString()
  businessName: string;

  @ApiProperty({ example: 45.00 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Tarjeta' })
  @IsString()
  method: string;

  @ApiProperty({ example: '2026-06-10' })
  @IsString()
  date: string;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

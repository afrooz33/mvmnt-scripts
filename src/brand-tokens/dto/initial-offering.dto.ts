import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  Min,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class InitialOfferingDto {
  @ApiProperty({
    description: 'Name of the offering',
    example: 'Initial Token Sale',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  readonly name: string

  @ApiProperty({
    description: 'Description of the offering',
    example: 'First public sale of MyBrand tokens',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  readonly description: string

  @ApiProperty({
    description: 'Start time of the offering',
    example: '2024-03-20T00:00:00Z',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString()
  readonly start_time: string

  @ApiProperty({
    description: 'End time of the offering',
    example: '2024-04-20T00:00:00Z',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsDateString()
  readonly end_time: string

  @ApiProperty({
    description: 'Minimum contribution amount in USD',
    example: 100,
  })
  @IsNotEmpty({ message: 'Minimum contribution is required' })
  @IsNumber()
  @Min(0, { message: 'Minimum contribution must be greater than or equal to 0' })
  @Type(() => Number)
  readonly min_contribution: number

  @ApiProperty({
    description: 'Maximum contribution amount in USD',
    example: 10000,
  })
  @IsNotEmpty({ message: 'Maximum contribution is required' })
  @IsNumber()
  @Min(1, { message: 'Maximum contribution must be greater than 0' })
  @Type(() => Number)
  readonly max_contribution: number

  @ApiProperty({
    description: 'Total token amount available for this offering',
    example: 1000000,
  })
  @IsNotEmpty({ message: 'Token amount is required' })
  @IsNumber()
  @Min(1, { message: 'Token amount must be greater than 0' })
  @Type(() => Number)
  readonly token_amount: number

  @ApiProperty({
    description: 'Price per token in USD',
    example: 0.1,
  })
  @IsNotEmpty({ message: 'Token price is required' })
  @IsNumber()
  @Min(0, { message: 'Token price must be greater than 0' })
  @Type(() => Number)
  readonly token_price: number

  @ApiPropertyOptional({
    description: 'Vesting period in days',
    example: 180,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Vesting period must be greater than or equal to 0' })
  @Type(() => Number)
  readonly vesting_period?: number
}

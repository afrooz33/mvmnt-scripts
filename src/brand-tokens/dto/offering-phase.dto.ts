import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsNumber,
  IsEnum,
  Min,
  IsOptional,
  IsObject,
  IsBoolean,
  IsNotEmpty,
  IsDateString,
  MaxLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { UserRank } from '@app/src/users/user/enums'
import { PhaseType } from '@app/src/brand-tokens/enums'

export class CreateOfferingPhaseDto {
  @ApiProperty({
    description: 'Name of the offering phase',
    example: 'Early Bird Round',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  readonly name: string

  @ApiProperty({
    description: 'Description of the offering phase',
    example: 'Special round for early supporters',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  readonly description: string

  @ApiProperty({
    description: 'Start time of the phase',
    example: '2024-03-20T00:00:00Z',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsDateString()
  readonly start_time: string

  @ApiProperty({
    description: 'End time of the phase',
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
    description: 'Total token amount available for this phase',
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

  @ApiProperty({
    description: 'Phase type',
    enum: PhaseType,
    example: PhaseType.OPEN_TO_ALL,
  })
  @IsEnum(PhaseType)
  readonly type: PhaseType

  @ApiProperty({
    description: 'Whether the phase requires whitelisting',
    example: true,
  })
  @IsBoolean()
  readonly requires_whitelist: boolean

  @ApiPropertyOptional({
    description: 'Minimum user rank required to participate',
    enum: UserRank,
    example: UserRank.BRONZE,
  })
  @IsOptional()
  @IsEnum(UserRank)
  readonly min_rank?: UserRank

  @ApiPropertyOptional({
    description: 'Additional configuration options',
    example: { feature_enabled: true },
  })
  @IsOptional()
  @IsObject()
  readonly config?: Record<string, any>
}

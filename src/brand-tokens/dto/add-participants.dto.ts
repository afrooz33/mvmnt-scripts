import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
  MaxLength,
} from 'class-validator'

class ParticipantDto {
  @ApiProperty({
    description: 'Wallet address of the participant',
    example: '0x1234567890abcdef1234567890abcdef12345678',
    maxLength: 42,
  })
  @IsNotEmpty({ message: 'Wallet address is required' })
  @IsString()
  @MaxLength(42, { message: 'Wallet address cannot exceed 42 characters' })
  readonly wallet_address: string

  @ApiProperty({
    description: 'Maximum allocation amount in USD',
    example: 1000,
  })
  @IsNotEmpty({ message: 'Maximum allocation is required' })
  @IsNumber()
  @Min(1, { message: 'Maximum allocation must be greater than 0' })
  @Type(() => Number)
  readonly max_allocation: number
}

export class AddParticipantsDto {
  @ApiProperty({
    description: 'List of participants to add',
    type: [ParticipantDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  readonly participants: ParticipantDto[]
}

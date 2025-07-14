import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  MaxLength,
  IsEmail,
  IsEnum,
} from 'class-validator'
import { ParticipationMethod } from '@app/src/brand-tokens/enums'

class WhitelistEntryDto {
  @ApiProperty({
    description: 'Wallet address to whitelist',
    example: '0x1234567890abcdef1234567890abcdef12345678',
    maxLength: 42,
  })
  @IsNotEmpty({ message: 'Wallet address is required' })
  @IsString()
  @MaxLength(42, { message: 'Wallet address cannot exceed 42 characters' })
  readonly wallet_address: string

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString()
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  readonly email: string
}

export class AddWhitelistDto {
  @ApiProperty({
    description: 'List of addresses to whitelist',
    type: [WhitelistEntryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhitelistEntryDto)
  readonly entries: WhitelistEntryDto[]

  @ApiProperty({
    description: 'Method of adding to whitelist',
    enum: ParticipationMethod,
  })
  @IsEnum(ParticipationMethod)
  method: ParticipationMethod
}

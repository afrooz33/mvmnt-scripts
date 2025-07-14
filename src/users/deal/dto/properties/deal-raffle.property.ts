import {
  IsDefined,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { DealPrizes } from './'
import { Type } from 'class-transformer'

export class DealRaffle {
  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly price_details: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly donation_reason: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly donation_rules: string

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  readonly winner_announcement_date: Date

  @ApiProperty({
    type: () => DealPrizes,
    isArray: true,
  })
  @Type(() => DealPrizes)
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(5)
  readonly raffle_prizes: DealPrizes[]
}

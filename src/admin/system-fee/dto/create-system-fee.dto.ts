import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateSystemFeeDto {
  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Default system fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly default_fee: number

  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Auction fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly auction_fee: number

  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Raffle fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly raffle_fee: number

  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Buynow fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly buynow_fee: number

  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Bussiness account auction fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly bussiness_auction_fee: number

  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Bussiness account raffle fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly bussiness_raffle_fee: number

  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Bussiness account buynow fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly bussiness_buynow_fee: number

  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Donation project donation fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly donation_project_donation_fee: number

  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Nonprofit donation fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly nonprofit_donation_fee: number

  @ApiProperty({
    type: 'number',
    default: 0,
    nullable: false,
    description: 'Fundraiser donation fee',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly fundraiser_donation_fee: number

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    nullable: true,
    description: 'User id of user for whom system fee is being created',
  })
  @IsOptional()
  readonly user: string
}

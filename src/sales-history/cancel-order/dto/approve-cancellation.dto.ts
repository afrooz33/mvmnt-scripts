import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  Min,
  IsUUID,
  IsEnum,
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator'
import { GasFeePayer } from '@app/src/purchase-history/cancel-order/enums'

export class ApproveCancellationItemDto {
  @ApiProperty({ description: 'ID of the OrderCancellationItemEntity to approve' })
  @IsUUID()
  @IsNotEmpty()
  id: string

  @ApiProperty({ description: 'Quantity being approved for cancellation', minimum: 1 })
  @Min(1)
  @IsNumber()
  @IsNotEmpty()
  approved_quantity: number
}

export class ApproveCancellationDto {
  @ApiProperty({
    type: [ApproveCancellationItemDto],
    description: 'Items to approve for cancellation',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ApproveCancellationItemDto)
  items: ApproveCancellationItemDto[]

  @ApiProperty({ description: 'Total refund amount in fiat currency' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  refund_amount: number

  @ApiProperty({ description: 'Total refund amount in cryptocurrency token' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  refund_amount_in_token: number

  @ApiProperty({ description: 'Token symbol' })
  @IsNotEmpty()
  @IsString()
  token_symbol: string

  @ApiProperty({ enum: GasFeePayer, description: 'Who pays the gas fee' })
  @IsNotEmpty()
  @IsEnum(GasFeePayer)
  gas_fee_payer: GasFeePayer

  @ApiPropertyOptional({ description: 'Notes from the seller to the buyer' })
  @IsOptional()
  @IsString()
  seller_notes?: string
}

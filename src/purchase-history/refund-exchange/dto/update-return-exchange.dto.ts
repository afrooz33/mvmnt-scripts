import {
  IsEnum,
  IsUUID,
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  ValidateIf,
  ArrayMinSize,
  ValidateNested,
  Min,
  IsArray,
  IsBoolean,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ReturnProcessOption,
  ReturnExchangeStatus,
  ReturnShippingFeeResponsibility,
} from '@app/src/purchase-history/refund-exchange/enums'

export class UpdateReturnExchangeItemDto {
  @ApiProperty({
    description: 'Return exchange item id',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string

  @ApiProperty({
    description: 'Return exchange item status',
    enum: Object.values(ReturnExchangeStatus),
    default: ReturnExchangeStatus.APPROVED,
  })
  @IsEnum(ReturnExchangeStatus)
  @IsNotEmpty()
  status: ReturnExchangeStatus

  @ApiProperty({
    description: 'Return exchange item approved quantity',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @ValidateIf(
    (object) =>
      object.status === ReturnExchangeStatus.APPROVED ||
      object.status === ReturnExchangeStatus.PARTIALLY_APPROVED,
  )
  @Min(1)
  approved_quantity?: number
}

export class RefundDetailsDto {
  @ApiProperty({
    description: 'Refund amount',
    example: 0.12345,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number

  @ApiProperty({
    description: 'Fees refund amount',
    example: 0.01,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  fees_refund?: number

  @ApiProperty({
    description: 'Additional refund reason',
    example: 'Compensation for delayed delivery',
  })
  @IsString()
  @IsOptional()
  additional_refund_reason?: string
}

export class UpdateReturnExchangeDto {
  @ApiProperty({
    description: 'Return exchange shipping fee responsibility',
    enum: ReturnShippingFeeResponsibility,
  })
  @IsEnum(ReturnShippingFeeResponsibility)
  @IsNotEmpty()
  shipping_fee_responsibility: ReturnShippingFeeResponsibility

  @ApiProperty({
    description: 'Return address',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  return_address: string

  @ApiProperty({
    description: 'Return exchange process option',
    enum: ReturnProcessOption,
    default: ReturnProcessOption.RETURN_AND_REFUND,
  })
  @IsEnum(ReturnProcessOption)
  @IsNotEmpty()
  process_option: ReturnProcessOption

  @ApiProperty({
    description: 'Refund gas fee payer',
    enum: ReturnShippingFeeResponsibility,
    default: ReturnShippingFeeResponsibility.BUYER,
  })
  @IsEnum(ReturnShippingFeeResponsibility)
  @IsNotEmpty()
  refund_gas_fee_payer: ReturnShippingFeeResponsibility

  @ApiProperty({
    description: 'Return exchange items',
    type: [UpdateReturnExchangeItemDto],
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateReturnExchangeItemDto)
  @ArrayMinSize(1)
  items: UpdateReturnExchangeItemDto[]

  @ApiPropertyOptional({
    description: 'Refund details',
    type: [RefundDetailsDto],
  })
  @ValidateNested({ each: true })
  @Type(() => RefundDetailsDto)
  @IsArray()
  @IsOptional()
  refund_details?: RefundDetailsDto[]

  @ApiPropertyOptional({
    description: 'Return exchange message to requester',
  })
  @IsString()
  @IsOptional()
  message_to_requester?: string

  @ApiPropertyOptional({
    description: 'Return exchange internal notes',
  })
  @IsString()
  @IsOptional()
  internal_notes?: string

  @ApiPropertyOptional({
    description: 'Process refund immediately',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  process_refund_immediately?: boolean
}

export class CreateReturnShipmentDto {
  @ApiProperty({
    description: 'Tracking number',
  })
  @IsString()
  @IsNotEmpty()
  tracking_number: string

  @ApiProperty({
    description: 'Carrier',
  })
  @IsString()
  @IsNotEmpty()
  carrier: string

  @ApiProperty({
    description: 'Items to ship',
    type: 'array',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReturnShipmentItemDto)
  items: ReturnShipmentItemDto[]
}

export class ReturnShipmentItemDto {
  @ApiProperty({
    description: 'Return exchange item id',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  return_item_id: string

  @ApiProperty({
    description: 'Quantity being shipped',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsString()
  @IsOptional()
  notes?: string
}

export class ProcessRefundDto {
  @ApiProperty({
    description: 'Return exchange id',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  return_exchange_id: string

  @ApiPropertyOptional({
    description: 'Transaction hash',
  })
  @IsString()
  @IsOptional()
  transaction_hash?: string

  @ApiPropertyOptional({
    description: 'Transaction details',
    type: 'object',
  })
  @IsOptional()
  transaction_details?: any

  @ApiPropertyOptional({
    description: 'Gas fee',
    example: 0.001,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  gas_fee?: number
}

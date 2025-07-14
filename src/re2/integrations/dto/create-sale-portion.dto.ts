import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsArray,
  IsDefined,
  IsString,
  MaxLength,
  IsNotEmpty,
  ValidateIf,
  ArrayMinSize,
} from 'class-validator'
import { IntegrationDonationType, IntegrationPayloadStatus } from '@app/src/re2/integrations/enums'

export class CreateSalePortionDto {
  @ApiProperty({
    description: 'Shopify integration name',
    example: 'Shopify',
    type: String,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  readonly name: string

  @ApiProperty({
    description: 'Integration donation type',
    enum: Object.values(IntegrationDonationType),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(IntegrationDonationType)
  readonly donation_type: IntegrationDonationType

  @ApiProperty({
    description: 'Integration donation amount',
    example: 10,
    type: Number,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly donation_value: number

  @ApiProperty({
    type: String,
    format: 'uuid',
    example: '00dbddae-2bd0-4270-865b-ecedaeb65514',
  })
  @IsNotEmpty()
  @ValidateIf((o) => !o.donation_project)
  nonprofit?: string[]

  @ApiProperty({
    type: String,
    format: 'uuid',
    example: '17c850ef-235b-4bb6-a3b2-5af61ceb1a7d',
  })
  @IsNotEmpty({ each: true, message: 'Invalid donation project id' })
  @ValidateIf((o) => !o.nonprofit)
  donation_project?: string[]

  @ApiProperty({
    description: 'Shopify product ids',
    isArray: true,
    example: [7611059634428],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateIf(
    (o) =>
      (o.donation_type === IntegrationDonationType.FIXED_AMOUNT_PER_PRODUCT ||
        o.donation_type === IntegrationDonationType.PERCENTAGE_OF_PRODUCT ||
        o.donation_type === IntegrationDonationType.ROUND_UP_PER_PRODUCT) &&
      (!o.shopify_collections || o.shopify_collections.length === 0) &&
      (!o.shopify_variants || o.shopify_variants.length === 0),
  )
  readonly shopify_products?: []

  @ApiProperty({
    description: 'Shopify collection ids',
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true, message: 'Invalid collection id' })
  @ValidateIf(
    (o) =>
      (o.donation_type === IntegrationDonationType.FIXED_AMOUNT_PER_PRODUCT ||
        o.donation_type === IntegrationDonationType.PERCENTAGE_OF_PRODUCT ||
        o.donation_type === IntegrationDonationType.ROUND_UP_PER_PRODUCT) &&
      (!o.shopify_products || o.shopify_products.length === 0) &&
      (!o.shopify_variants || o.shopify_variants.length === 0),
  )
  readonly shopify_collections?: []

  @ApiProperty({
    description: 'Shopify variant ids',
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true, message: 'Invalid variant id' })
  @ValidateIf(
    (o) =>
      (o.donation_type === IntegrationDonationType.FIXED_AMOUNT_PER_PRODUCT ||
        o.donation_type === IntegrationDonationType.PERCENTAGE_OF_PRODUCT ||
        o.donation_type === IntegrationDonationType.ROUND_UP_PER_PRODUCT) &&
      (!o.shopify_products || o.shopify_products.length === 0) &&
      (!o.shopify_collections || o.shopify_collections.length === 0),
  )
  readonly shopify_variants?: []

  @ApiProperty({
    type: 'enum',
    enum: Object.values(IntegrationPayloadStatus),
    default: IntegrationPayloadStatus.DISABLED,
    description: 'Integration status',
  })
  @IsNotEmpty()
  @IsEnum(IntegrationPayloadStatus)
  readonly status: IntegrationPayloadStatus
}

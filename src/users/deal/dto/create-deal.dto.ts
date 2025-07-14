import {
  IsEnum,
  IsUUID,
  IsArray,
  IsDefined,
  IsNumber,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  ValidateIf,
  ArrayMaxSize,
  ArrayMinSize,
  IsDateString,
  ValidateNested,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsImageAvailable,
  IsBrandAvailable,
  IsValidDealOption,
  IsNonprofitUserAvailable,
  IsDealCategoryAvailable,
  IsDonationProjectAvailable,
} from '@app/src/shared/decorators'
import { UploadType } from '@app/src/shared/enums'
import { IsValidDonationType } from '@app/src/shared/validations'
import {
  DealType,
  DealStatus,
  DonationType,
  ItemCondition,
  DealCurrencyType,
  DealResellingCap,
  DealAvailability,
  ShippingCoveredBy,
  ReturnEligibility,
  DealAllowReselling,
  PurchaseAvailability,
  DealResellingAmountType,
} from '@app/src/users/deal/enums'
import { DealVariant, DealRaffle, DealShippingFee, DealOption } from './properties'

export class CreateDealDto {
  @ApiProperty({
    type: 'enum',
    enum: Object.values(DealType),
    default: DealType.AUCTION,
    nullable: false,
  })
  @IsEnum(DealType, {
    message: 'Invalid deal type',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly deal_type: DealType

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(255)
  @ValidateIf((o) => o.status !== DealStatus.DRAFT)
  readonly name: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf(
    (o) =>
      (o.deal_type === DealType.BUYNOW || o.deal_type === DealType.AUCTION) &&
      o.status !== DealStatus.DRAFT,
  )
  readonly description: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.deal_type === DealType.AUCTION && o.status !== DealStatus.DRAFT)
  readonly size: string

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: 'e4b0fe4d-97d9-44ee-b431-fe82c3d855f7',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDealCategoryAvailable({
    message: 'Invalid deal category',
  })
  @ValidateIf((o) => o.status !== DealStatus.DRAFT)
  readonly category: string

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: 'ddcf7318-3855-4e14-b0c8-194ce4c8c2f0',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsBrandAvailable({
    message: 'Invalid brand',
  })
  @ValidateIf((o) => o.status !== DealStatus.DRAFT)
  readonly brand: string

  @ApiProperty({
    type: 'enum',
    enum: Object.values(ItemCondition),
    default: ItemCondition.NEW_OR_USED,
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.status !== DealStatus.DRAFT)
  readonly item_condition: ItemCondition

  @ApiProperty({
    type: 'enum',
    enum: Object.values(ReturnEligibility),
    default: null,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(ReturnEligibility)
  @ValidateIf((o) => o.deal_type === DealType.AUCTION && o.status !== DealStatus.DRAFT)
  readonly return_eligibility?: ReturnEligibility

  @ApiPropertyOptional({
    type: 'enum',
    enum: Object.values(ShippingCoveredBy),
    default: ShippingCoveredBy.BUYER,
  })
  @IsOptional()
  @IsEnum(ShippingCoveredBy)
  readonly shipping_covered_by?: ShippingCoveredBy

  @ApiProperty({
    type: [String],
    format: 'uuid',
    example: ['15d70949-793c-468a-8cfd-0f01325b25cc'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsImageAvailable(
    {
      message: 'Invalid image',
    },
    UploadType.DEAL,
  )
  @ValidateIf((o) => o.deal_type === DealType.AUCTION && o.status !== DealStatus.DRAFT)
  readonly images: string[]

  @ApiProperty({
    type: 'number',
    format: 'float',
    example: '1000.00',
  })
  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.deal_type !== DealType.BUYNOW && o.status !== DealStatus.DRAFT)
  readonly starting_price: number

  @ApiProperty({
    type: 'enum',
    enum: Object.values(PurchaseAvailability),
    default: PurchaseAvailability.IMMEDIATELY,
    nullable: false,
  })
  @IsEnum(PurchaseAvailability, {
    message: 'Invalid purchase availability',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly purchase_availability: PurchaseAvailability

  @ApiProperty({
    type: 'enum',
    enum: Object.values(DealAvailability),
    default: DealAvailability.MATCH_PURCHASE_AVAILABILITY,
    nullable: false,
  })
  @IsEnum(DealAvailability, {
    message: 'Invalid deal availability',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly deal_availability: DealAvailability

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  @ValidateIf(
    (o) => o.deal_availability === DealAvailability.SPECIFIC_DATE || o.status !== DealStatus.DRAFT,
  )
  deal_access_date: Date

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  @ValidateIf(
    (o) =>
      o.purchase_availability === PurchaseAvailability.SPECIFIC_DATE ||
      o.status !== DealStatus.DRAFT,
  )
  start_date: Date

  @ApiPropertyOptional({
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  readonly end_date: Date

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    example: '961c7124-c385-4d26-8446-b1d6bcf12043',
    nullable: true,
  })
  @IsOptional()
  readonly shipping_method?: string

  @ApiPropertyOptional({
    type: () => [DealShippingFee],
  })
  @IsOptional()
  readonly shipping_fee?: DealShippingFee[]

  @ApiPropertyOptional()
  @IsOptional()
  readonly sender_location?: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.deal_type === DealType.RAFFLE || o.deal_type === DealType.AUCTION)
  readonly estimated_delivery_days?: number

  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsNonprofitUserAvailable({
    message: 'Invalid nonprofit user',
  })
  @ValidateIf((o) => o.status !== DealStatus.DRAFT && !o.donation_project)
  readonly donation_nonprofit?: string

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsDonationProjectAvailable({
    message: 'Invalid donation project',
  })
  @ValidateIf((o) => o.status !== DealStatus.DRAFT && !o.donation_nonprofit)
  readonly donation_project?: string

  @ApiProperty({
    type: 'enum',
    enum: Object.values(DonationType),
    default: DonationType.FIXED_PER_ORDER,
    nullable: false,
  })
  @IsEnum(DonationType, {
    message: 'Invalid donation type',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsValidDonationType()
  @ValidateIf((o) => o.status !== DealStatus.DRAFT)
  readonly donation_type: DonationType

  @ApiProperty({
    type: 'integer',
    format: 'float',
    default: '9.99',
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.status !== DealStatus.DRAFT)
  readonly donation_amount: number

  @ApiPropertyOptional({
    type: 'enum',
    enum: Object.values(DealCurrencyType),
    default: DealCurrencyType.FIAT,
    nullable: true,
  })
  @IsOptional()
  readonly currency?: DealCurrencyType

  @ApiProperty({
    type: [DealVariant],
  })
  @IsArray()
  @IsDefined()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @Type(() => DealVariant)
  @ValidateNested({ each: true, message: 'Invalid variant' })
  @ValidateIf((o) => o.deal_type === DealType.BUYNOW && o.status !== DealStatus.DRAFT)
  readonly variants?: DealVariant[]

  @ApiProperty({
    type: [DealOption],
    description: 'Deal options ids',
  })
  @IsArray()
  @IsOptional()
  @IsValidDealOption({
    message: 'Invalid deal option',
  })
  @ValidateIf((o) => o.deal_type === DealType.BUYNOW && o.status !== DealStatus.DRAFT)
  options: DealOption[]

  @ValidateIf((o) => o.deal_type === DealType.RAFFLE && o.status !== DealStatus.DRAFT)
  @ApiProperty({
    type: DealRaffle,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly raffles?: DealRaffle

  @IsOptional()
  status?: DealStatus

  /**
   * @description Reselling related fields
   */
  @ApiPropertyOptional({
    type: 'enum',
    enum: Object.values(DealAllowReselling),
    default: DealAllowReselling.DISABLE,
  })
  @IsOptional()
  @IsEnum(DealAllowReselling)
  @ValidateIf((o) => o.deal_type === DealType.BUYNOW)
  allow_reselling?: DealAllowReselling

  @ApiPropertyOptional({
    type: 'enum',
    enum: Object.values(DealResellingAmountType),
    default: DealResellingAmountType.FIXED_PER_AMOUNT,
  })
  @IsOptional()
  @IsEnum(DealResellingAmountType)
  @ValidateIf(
    (o) => o.deal_type === DealType.BUYNOW && o.allow_reselling === DealAllowReselling.ENABLE,
  )
  reselling_amount_type?: DealResellingAmountType

  @ApiPropertyOptional({
    type: 'number',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @ValidateIf(
    (o) =>
      o.deal_type === DealType.BUYNOW &&
      o.reselling_amount_type &&
      o.allow_reselling === DealAllowReselling.ENABLE &&
      o.status !== DealStatus.DRAFT,
  )
  reselling_fee?: number

  @ApiPropertyOptional({
    type: 'enum',
    enum: Object.values(DealResellingCap),
    default: DealResellingCap.NONE,
  })
  @IsOptional()
  @IsEnum(DealResellingCap)
  @ValidateIf(
    (o) =>
      o.deal_type === DealType.BUYNOW &&
      o.allow_reselling === DealAllowReselling.ENABLE &&
      o.status !== DealStatus.DRAFT,
  )
  reselling_cap?: DealResellingCap

  @ApiPropertyOptional({
    type: 'string',
    default: '',
  })
  @IsOptional()
  @ValidateIf(
    (o) =>
      o.deal_type === DealType.BUYNOW &&
      o.reselling_cap !== DealResellingCap.NONE &&
      o.allow_reselling === DealAllowReselling.ENABLE &&
      o.status !== DealStatus.DRAFT,
  )
  reselling_cap_value?: string

  @ApiProperty({
    description: 'If deal is one of its kind',
    type: Boolean,
    default: false,
  })
  @IsDefined()
  @Transform(({ obj, key }) => {
    const value = obj[key]

    if (typeof value === 'boolean') {
      return value
    }

    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true
      if (value.toLowerCase() === 'false') return false
    }

    throw new Error(`Invalid value for is_one_of_kind: ${value}`)
  })
  @ValidateIf((o) => o.deal_type === DealType.BUYNOW && o.status !== DealStatus.DRAFT)
  readonly is_one_of_kind: boolean

  @ApiProperty({
    description: 'Whitelisted token addresses',
    type: [String],
    example: ['0x9cee8B6C0520853fB898d6a4d2d67048768b4dB6'],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @ValidateIf((o) => o.status !== DealStatus.DRAFT)
  available_tokens?: string[]

  @ApiProperty({
    description: 'Prioritised token address',
    type: String,
    example: '0x9cee8B6C0520853fB898d6a4d2d67048768b4dB6',
  })
  @IsNotEmpty()
  @ValidateIf((o) => o.status !== DealStatus.DRAFT)
  prioritised_token: string
}

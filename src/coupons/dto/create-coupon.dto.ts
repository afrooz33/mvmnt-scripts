import {
  IsArray,
  Validate,
  ValidationOptions,
  registerDecorator,
  ValidatorConstraint,
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator'
import {
  IsEnum,
  IsNumber,
  IsString,
  IsDefined,
  MaxLength,
  IsNotEmpty,
  ValidateIf,
  IsDateString,
  IsAlphanumeric,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CouponType } from '@app/src/coupons/enums'
import {
  CouponTargetDeal,
  CouponTargetUser,
  CouponDiscountType,
  CouponTargetCountry,
  PurchaseRequirementType,
} from '@app/src/admin/coupons/enums'
import { CouponDealVariantProperty } from './properties'

@ValidatorConstraint({ name: 'Exclusive', async: false })
export class Exclusive implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const { object } = args

    if (
      (object['max_usage'] !== undefined && object['max_usage_per_user'] !== undefined) ||
      (object['max_usage'] === undefined && object['max_usage_per_user'] === undefined)
    ) {
      return false
    }

    return true
  }

  defaultMessage(args: ValidationArguments) {
    return `Either "${args.property}" or "${args.constraints[0]}" must be provided, but not both.`
  }
}

function IsDateTodayOrFuture(property: string, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsDateTodayOrFuture',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { object } = args
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (object['start_date'] === object['end_date']) {
            return false
          }

          return new Date(object[property]).getTime() >= today.getTime()
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a future date or today.`
        },
      },
    })
  }
}

export class CreateCouponDto {
  @ApiProperty({
    type: 'string',
    description: 'Coupon code',
    example: 'c0upON1234Code',
    required: true,
  })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(20)
  @IsAlphanumeric()
  readonly code: string

  @ApiProperty({
    required: true,
    description: 'Coupon type',
    enum: Object.values(CouponType),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(CouponType)
  readonly coupon_type: CouponType

  @ApiProperty({
    description: 'Discount type',
    enum: Object.values(CouponDiscountType),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(CouponDiscountType)
  @ValidateIf((o) => o.coupon_type !== CouponType.FREE_SHIPPING)
  readonly discount_type: CouponDiscountType

  @ApiProperty({
    description: 'Coupon discount percentage or amount',
    example: 10,
    nullable: false,
  })
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.coupon_type !== CouponType.FREE_SHIPPING)
  readonly discount: number

  @ApiProperty({
    nullable: false,
    description: 'Coupon start date',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  @IsDateTodayOrFuture('start_date')
  readonly start_date: Date

  @ApiProperty({
    nullable: false,
    description: 'Coupon end date',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsDateString()
  @IsDateTodayOrFuture('end_date')
  readonly end_date: Date

  @ApiProperty({
    description: 'Minimum purchase requirement',
    enum: Object.values(PurchaseRequirementType),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(PurchaseRequirementType)
  readonly purchase_requirement_type: PurchaseRequirementType

  @ApiProperty({
    description: 'Minimum purchase requirement amount',
    example: 10,
    nullable: false,
  })
  @IsNumber()
  @IsDefined()
  @IsNotEmpty()
  readonly purchase_requirement: number

  @ApiPropertyOptional({
    description: 'Coupon max usage',
    example: 100,
    nullable: false,
  })
  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.max_usage_per_user === undefined)
  readonly max_usage: number

  @ApiPropertyOptional({
    description: 'Coupon max usage per user',
    example: 100,
    nullable: false,
  })
  @IsDefined()
  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o) => o.max_usage === undefined)
  readonly max_usage_per_user: number

  @Validate(Exclusive, ['max_usage_per_user'])
  exclusive: string

  @ApiProperty({
    description: 'Target users of coupon',
    example: CouponTargetUser.ALL,
    enum: Object.values(CouponTargetUser),
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(CouponTargetUser)
  readonly target_user: CouponTargetUser

  @ApiPropertyOptional({
    isArray: true,
    description: 'Coupon users',
    example: ['f0abf3d3-99b4-4f3e-90ab-1292ab33610c'],
  })
  @IsArray()
  @IsDefined()
  @IsNotEmpty({ each: true })
  @ValidateIf((o) => o.target_user === CouponTargetUser.TARGET_USERS)
  readonly users: string[]

  @ApiProperty({
    description: 'Target deals of coupon',
    example: CouponTargetDeal.ALL,
    enum: Object.values(CouponTargetDeal),
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(CouponTargetDeal)
  @ValidateIf((o) => o.coupon_type === CouponType.ITEM_PRICE)
  readonly target_deal: CouponTargetDeal

  @ApiPropertyOptional({
    isArray: true,
    description: 'Coupon allowed deals',
    type: () => CouponDealVariantProperty,
  })
  @IsArray()
  @IsDefined()
  @IsNotEmpty({ each: true })
  @ValidateIf(
    (o) => o.target_deal !== CouponTargetDeal.ALL && o.coupon_type === CouponType.ITEM_PRICE,
  )
  readonly deals_variants: CouponDealVariantProperty[]

  @ApiProperty({
    description: 'Target countries of coupon',
    example: CouponTargetCountry.ALL,
    enum: Object.values(CouponTargetCountry),
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(CouponTargetCountry)
  @ValidateIf((o) => o.coupon_type === CouponType.FREE_SHIPPING)
  readonly target_country: CouponTargetCountry

  @ApiPropertyOptional({
    isArray: true,
    description: 'Coupon available countries',
    example: ['271ab020-ccab-4ba6-9967-97ac2c0656c4'],
  })
  @IsArray()
  @IsDefined()
  @IsNotEmpty({ each: true })
  @ValidateIf(
    (o) =>
      o.target_country !== CouponTargetCountry.ALL && o.coupon_type === CouponType.FREE_SHIPPING,
  )
  readonly countries: string[]

  @ApiProperty({
    description: 'Exclude shipping rates over a certain amount',
    type: () => Boolean,
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.coupon_type === CouponType.FREE_SHIPPING)
  readonly is_shipping_fee_excluded: boolean

  @ApiProperty({
    description: 'Exclude shipping rates order amount',
    example: 10,
    nullable: true,
  })
  @IsDefined()
  @IsNumber()
  @ValidateIf(
    (o) => o.is_shipping_fee_excluded === true && o.coupon_type === CouponType.FREE_SHIPPING,
  )
  readonly exclude_shipping_fee: number
}

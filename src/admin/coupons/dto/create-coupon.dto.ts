import { ApiProperty } from '@nestjs/swagger'
import {
  IsEnum,
  IsArray,
  IsDefined,
  ValidateIf,
  IsNotEmpty,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator'
import {
  CouponType,
  CouponStatus,
  CouponTargetUser,
  CouponUserSelection,
} from '@app/src/admin/coupons/enums'
import { Type } from 'class-transformer'
import { IsLanguageActive } from '@app/src/shared/decorators'
import { UserSearchConditionProperty, CouponTranslationsProperty } from './properties'

export class CreateCouponDto {
  @ApiProperty({
    description: 'Coupon name',
    example: 'Coupon name',
    nullable: false,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly name: string

  @ApiProperty({
    description: 'Coupon description',
    example: 'Coupon description',
    nullable: false,
    maximum: 500,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly description: string

  @ApiProperty({
    description: 'Coupon type',
    example: CouponType.PERCENTAGE,
    enum: Object.values(CouponType),
    nullable: false,
  })
  @IsEnum(CouponType)
  @IsDefined()
  readonly coupon_type: CouponType

  @ApiProperty({
    description: 'Coupon start date',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsNotEmpty()
  @IsDefined()
  start_date: Date

  @ApiProperty({
    description: 'Coupon end date',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly end_date: Date

  @ApiProperty({
    description: 'Coupon discount percentage or amount',
    example: 10,
    nullable: false,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly discount: number

  @ApiProperty({
    description: 'Coupon max discount',
    example: 100,
    nullable: false,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly max_discount: number

  @ApiProperty({
    description: 'Coupon min order amount',
    example: 100,
    nullable: false,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly min_order_amount: number

  @ApiProperty({
    description: 'Coupon max usage',
    example: 100,
    nullable: false,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly max_usage: number

  @ApiProperty({
    description: 'Coupon max usage per user',
    example: 100,
    nullable: false,
  })
  @IsNotEmpty()
  @IsDefined()
  readonly max_usage_per_user: number

  @ApiProperty({
    description: 'Target users of coupon',
    example: CouponTargetUser.ALL,
    enum: Object.values(CouponTargetUser),
    nullable: false,
  })
  @IsEnum(CouponTargetUser)
  @IsDefined()
  @IsNotEmpty()
  readonly target_user: CouponTargetUser

  @ApiProperty({
    description: 'Coupon user selection',
    example: CouponUserSelection.AUTO,
    enum: Object.values(CouponUserSelection),
    nullable: false,
  })
  @IsEnum(CouponUserSelection)
  @IsDefined()
  @IsNotEmpty()
  readonly user_selection_mode: CouponUserSelection

  @ApiProperty({
    description: 'Coupon user search conditions',
    nullable: false,
    type: () => [UserSearchConditionProperty],
  })
  @Type(() => UserSearchConditionProperty)
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10, { message: 'Maximum of 10 user search conditions' })
  @ValidateIf((o) => o.target_user !== CouponTargetUser.ALL)
  readonly user_search_conditions: UserSearchConditionProperty[]

  @ApiProperty({
    description: 'Coupon status',
    example: CouponStatus.ENABLED,
    enum: Object.values(CouponStatus),
    nullable: false,
  })
  @IsEnum(CouponStatus)
  @IsDefined()
  @IsNotEmpty()
  readonly status: CouponStatus

  @ApiProperty({
    type: [CouponTranslationsProperty],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsLanguageActive({
    message: 'Invalid language',
  })
  readonly translations: CouponTranslationsProperty[]
}

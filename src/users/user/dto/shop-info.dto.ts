import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator'
import { BusinessType, ShopInfoSettings } from '@app/src/users/user/enums'

export class ShopInfoDto {
  @ApiPropertyOptional({
    enum: Object.values(BusinessType),
    default: BusinessType.SOLE_PROPRIETOR,
    nullable: false,
  })
  @IsOptional()
  @IsEnum(BusinessType)
  @ValidateIf((o) =>
    [BusinessType.SOLE_PROPRIETOR, BusinessType.CORPORATION].includes(o.business_type),
  )
  readonly business_type: BusinessType

  @ApiPropertyOptional({
    enum: Object.values(ShopInfoSettings),
    default: ShopInfoSettings.ON_REQUEST,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(ShopInfoSettings)
  @ValidateIf((o) => o.business_type === BusinessType.SOLE_PROPRIETOR)
  readonly show_shop_details: ShopInfoSettings

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @ValidateIf((o) =>
    [BusinessType.SOLE_PROPRIETOR, BusinessType.CORPORATION].includes(o.business_type),
  )
  readonly name: string

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @ValidateIf((o) =>
    [BusinessType.SOLE_PROPRIETOR, BusinessType.CORPORATION].includes(o.business_type),
  )
  readonly person_in_charge: string

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @ValidateIf((o) =>
    [BusinessType.SOLE_PROPRIETOR, BusinessType.CORPORATION].includes(o.business_type),
  )
  readonly phone_number: string

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @ValidateIf((o) =>
    [BusinessType.SOLE_PROPRIETOR, BusinessType.CORPORATION].includes(o.business_type),
  )
  readonly address: string

  @ApiPropertyOptional({ nullable: false })
  @IsOptional()
  @ValidateIf((o) =>
    [BusinessType.SOLE_PROPRIETOR, BusinessType.CORPORATION].includes(o.business_type),
  )
  readonly postcode: string

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  readonly policy?: string
}

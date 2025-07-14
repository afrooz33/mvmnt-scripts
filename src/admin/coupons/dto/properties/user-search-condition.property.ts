import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { Conditions, Fields } from '@app/src/admin/coupons/enums'

export class UserSearchConditionProperty {
  @ApiProperty({
    description: 'User search field',
    nullable: false,
    isArray: false,
    enum: Object.values(Fields),
    default: Fields.DEAL_BRAND,
  })
  @IsEnum(Fields)
  @IsDefined()
  field: Fields

  @ApiProperty({
    description: 'User search condition',
    nullable: false,
    isArray: false,
    enum: Object.values(Fields),
    default: Conditions.CONTAINS,
  })
  @IsEnum(Conditions)
  @IsDefined()
  condition: Conditions

  @ApiProperty({
    description: 'User search values',
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  values: string
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsUUID, ValidateIf } from 'class-validator'
import { Conditions, Fields } from '@app/src/admin/coupons/enums'

export class HomepageSearchConditionProperty {
  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    example: '5d498f72-7a9f-4df6-ba5e-1af403eeb87f',
  })
  @IsUUID()
  @IsOptional()
  readonly id?: string

  @ApiProperty({
    description: 'Search field',
    nullable: false,
    isArray: false,
    enum: Object.values(Fields),
    default: Fields.DEAL_BRAND,
  })
  @IsDefined()
  @IsEnum(Fields)
  field: Fields

  @ApiProperty({
    description: 'Search condition',
    nullable: false,
    isArray: false,
    enum: Object.values(Conditions),
    default: Conditions.CONTAINS,
  })
  @IsDefined()
  @IsEnum(Conditions)
  condition: Conditions

  @ApiProperty({
    description: 'Search values',
    nullable: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @ValidateIf((o) => o.field !== Fields.SORT_ORDER)
  values: string
}

import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateCouponDto } from './'
import { UpdateUserSearchConditionProperty } from './properties'

export class UpdateCouponDto extends CreateCouponDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: '8b4d48a4-590d-47d3-ab22-219f2c496ce9',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  readonly id: string

  @ApiProperty({
    description: 'Update coupon user search conditions',
    nullable: false,
    type: () => [UpdateUserSearchConditionProperty],
  })
  @Type(() => UpdateUserSearchConditionProperty)
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10, { message: 'Maximum of 10 user search conditions' })
  user_search_conditions: UpdateUserSearchConditionProperty[]
}

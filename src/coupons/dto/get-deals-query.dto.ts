import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsArray, IsOptional, ArrayMinSize, ArrayMaxSize } from 'class-validator'
import { MyPaginateDto } from '@app/src/shared/base'
import { DealStatus, DealType } from '@app/src/users/deal/enums'

export class GetDealsQueryDto extends MyPaginateDto {
  @ApiPropertyOptional({
    description: 'Keyword to search for deals',
  })
  @IsOptional()
  readonly keyword?: string

  @ApiPropertyOptional({
    name: 'status[]',
    description: 'Deal status',
    isArray: true,
    enum: Object.values(DealStatus),
  })
  @IsArray()
  @IsOptional()
  @IsEnum(DealStatus, { each: true })
  readonly status?: DealStatus[]

  @ApiProperty({
    name: 'deal_type[]',
    description: 'Deal type',
    isArray: true,
    enum: Object.values(DealType),
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsEnum(DealType, { each: true })
  readonly deal_type?: DealType[]
}

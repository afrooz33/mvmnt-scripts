import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsDefined, IsNotEmpty } from 'class-validator'
import { StarType } from '@app/src/users/stars/enums'

export class StarPercentileHistoryQueryDto {
  @ApiProperty({
    description: 'Star type for which to get percentile ranking history',
    enum: Object.values(StarType),
    example: StarType.TRANSACTION,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(StarType)
  readonly star_type: StarType
}

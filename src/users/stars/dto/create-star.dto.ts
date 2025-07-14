import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsEnum, IsDefined, IsNotEmpty } from 'class-validator'
import { StarType, StarActionType } from '@app/src/users/stars/enums'

export class CreateStarDto {
  @ApiProperty({
    description: 'User ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly user: string

  @ApiProperty({
    description: 'Star type',
    enum: Object.values(StarType),
  })
  @IsDefined()
  @IsEnum(StarType)
  readonly type: StarType

  @ApiProperty({
    description: 'Star action type',
    enum: Object.values(StarActionType),
  })
  @IsDefined()
  @IsEnum(StarActionType)
  readonly action: StarActionType
}

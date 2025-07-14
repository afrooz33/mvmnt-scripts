import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsUUID } from 'class-validator'
import { SharedSnsPlatform } from '@app/src/users/share/enums'

export class ShareNonprofitDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Nonprofit user id',
    example: '0d79240f-832e-4d37-b2dd-35ff317f2a50',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  nonprofit: string

  @ApiProperty({
    description: 'Share type',
    example: SharedSnsPlatform.OTHER,
    enum: SharedSnsPlatform,
  })
  @IsEnum(SharedSnsPlatform)
  @IsNotEmpty()
  @IsDefined()
  social_platform: SharedSnsPlatform
}

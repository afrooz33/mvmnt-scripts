import { IsDefined, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsUserDeal } from '@app/src/shared/decorators'
import { SharedSnsPlatform } from '@app/src/users/share/enums'

export class ShareDealDto {
  @ApiProperty({
    description: 'Deal id',
    example: '0d79240f-832e-4d37-b2dd-35ff317f2a50',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsUserDeal()
  deal: string

  @ApiPropertyOptional({
    description: 'User id',
    example: '30435443-32fd-4b16-92f5-d5aa8932b1c2',
    format: 'uuid',
  })
  @IsOptional()
  user: string

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

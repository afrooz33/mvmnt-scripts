import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsUUID } from 'class-validator'
import { SharedSnsPlatform } from '@app/src/users/share/enums'

export class ShareDonationProjectDto {
  @ApiProperty({
    description: 'Donation project id',
    example: 'd31ba476-de53-484c-9890-941ba8821805',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  donation_project: string

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

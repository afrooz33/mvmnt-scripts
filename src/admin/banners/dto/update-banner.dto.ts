import { IsDefined, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CreateBannerDto } from './create-banner.dto'

export class UpdateBannerDto extends CreateBannerDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string
}

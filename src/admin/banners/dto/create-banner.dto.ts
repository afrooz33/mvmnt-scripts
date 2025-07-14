import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsUUID, IsUrl } from 'class-validator'
import { BannerSection, BannerStatus } from '@app/src/admin/banners/enums'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { IsImageAvailable } from '@app/src/shared/decorators'
import { UploadType } from '@app/src/shared/enums'

export class CreateBannerDto {
  @ApiProperty({ enum: BannerSection, required: true })
  @IsEnum(BannerSection)
  @IsDefined()
  readonly section: BannerSection

  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsDefined()
  @IsUUID()
  @IsImageAvailable(
    {
      message: 'Image is not available',
    },
    UploadType.BANNER,
  )
  readonly image_pc: ImagesEntity

  @ApiProperty({
    type: String,
    format: 'uuid',
  })
  @IsDefined()
  @IsUUID()
  @IsImageAvailable(
    {
      message: 'Image is not available',
    },
    UploadType.BANNER,
  )
  readonly image_sp: ImagesEntity

  @ApiProperty({ required: true })
  @IsDefined()
  @IsUrl()
  readonly url: string

  @ApiProperty({ enum: BannerStatus, required: true })
  @IsEnum(BannerStatus)
  @IsDefined()
  readonly status: BannerStatus
}

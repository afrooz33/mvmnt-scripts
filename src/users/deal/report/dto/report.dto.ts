import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UploadType } from '@app/src/shared/enums'
import { IsImageAvailable } from '@app/src/shared/decorators'
import { ImagesEntity } from '@app/src/images/entities/images.entity'

export class ReportDto {
  @ApiProperty({
    description: 'Description of the report',
    type: String,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly description: string

  @ApiProperty({
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(11)
  @IsImageAvailable(
    {
      message: 'Image is not available',
    },
    UploadType.DEAL_REPORT,
  )
  readonly images: ImagesEntity[]
}

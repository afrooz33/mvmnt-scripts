import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { UploadType } from '@app/src/shared/enums'

export class MarkFeaturedDto {
  @ApiProperty({
    format: 'uuid',
    type: 'string',
    example: '12385ea6-a6ab-4e9d-9aa2-c2b9863cba0c',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly oldFeatured: string

  @ApiProperty({
    format: 'uuid',
    type: 'string',
    example: '04f51e16-85d6-4bff-b3b1-01fda58d2c54',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly newFeatured: string

  @ApiProperty({ enum: UploadType })
  @IsEnum(UploadType)
  readonly type: UploadType
}

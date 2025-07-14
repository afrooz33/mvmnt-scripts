import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDefined, IsEnum } from 'class-validator'
import { UploadType } from '@app/src/shared/enums'
import { Transform } from 'class-transformer'

export class UploadDto {
  @ApiProperty({ type: 'formdata', default: false, example: true })
  @IsBoolean()
  @IsDefined()
  @Transform(({ obj, key }) => {
    const value = obj[key]

    if (typeof value === 'string') {
      return obj[key] === 'true'
    }

    return value
  })
  readonly is_featured: boolean

  @ApiProperty({ enum: UploadType, type: 'formdata' })
  @IsEnum(UploadType)
  readonly type: UploadType

  @ApiProperty({ type: 'file' })
  readonly file: any
}

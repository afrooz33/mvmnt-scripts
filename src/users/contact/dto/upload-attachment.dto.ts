import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UploadType } from '@app/src/shared/enums'

export class UploadAttachmentDto {
  @ApiProperty({ enum: UploadType, type: 'formdata' })
  @IsEnum(UploadType)
  readonly type: UploadType

  @ApiProperty({ type: 'file' })
  readonly file: any
}

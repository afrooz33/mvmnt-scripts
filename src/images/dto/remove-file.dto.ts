import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { UploadType } from '@app/src/shared/enums'

export class RemoveFileDto {
  @ApiProperty({ enum: UploadType })
  @IsEnum(UploadType)
  readonly type: UploadType

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly filename: string

  @ApiProperty()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}

import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { UpdateStatus } from '@app/src/admin/guides/enums'

export class UpdateStatusDto {
  @ApiProperty({ enum: UpdateStatus })
  @IsEnum(UpdateStatus)
  readonly status: UpdateStatus
}

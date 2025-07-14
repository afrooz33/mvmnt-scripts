import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { ChangeStatus } from '@app/src/shared/enums'

export class ChangeStatusDto {
  @ApiProperty({
    description: 'Change status',
    enum: Object.values(ChangeStatus),
    default: ChangeStatus.DISABLED,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(ChangeStatus)
  readonly status: ChangeStatus
}

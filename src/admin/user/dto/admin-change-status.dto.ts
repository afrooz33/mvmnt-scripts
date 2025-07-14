import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { ChangeAccountStatus } from '@app/src/admin/user/enums'

export class AdminChangeStatusDto {
  @ApiProperty({
    description: 'Admin user status',
    enum: Object.values(ChangeAccountStatus),
    default: ChangeAccountStatus.DISABLED,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(ChangeAccountStatus)
  readonly status: ChangeAccountStatus
}

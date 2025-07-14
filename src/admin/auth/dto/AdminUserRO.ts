import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AccountStatus, AdminRole } from '@app/src/admin/user/enums'
import { JwtDto } from '@app/src/shared/auth/dto'
import { CommonRO } from '@app/src/shared/dto'

export class AdminUserRO extends CommonRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  readonly email: string

  @ApiProperty({ enum: AdminRole })
  readonly role: AdminRole

  @ApiProperty({ enum: AccountStatus })
  readonly status: AccountStatus

  @ApiPropertyOptional()
  readonly admin_profile?: any

  @ApiPropertyOptional({ type: JwtDto })
  jwt?: JwtDto

  @ApiPropertyOptional()
  readonly wallet_address?: string

  @ApiPropertyOptional()
  readonly smart_account?: string
}
